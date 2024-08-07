import { System, Entity } from "ape-ecs";
import { clamp } from "three/src/math/MathUtils.js";
import * as THREE from 'three'
import RigidBody from "../rigidbody";
import { RigidBodyArithmaticError, RigidBodyDataError } from "../exceptions";
import { crossMatrix, reorthogonalize, EPSILON } from "../utils";

class PhysicsSystem extends System {
    init(clock, physicsClock) {
        this.scriptsQuery = this.world.createQuery().fromAll('Script').persist();
        this.rigidbodyQuery = this.world.createQuery().fromAll('Transform', 'RigidBody').persist();
        this.clock = clock;
        this.physicsClock = physicsClock;

        let rigidBodyEntities = this.rigidbodyQuery.refresh().execute();
        this._phyStart(rigidBodyEntities);
    }

    update(currentTick) {

        let scriptEntities = this.scriptsQuery.refresh().execute();
        let newRigidBodyEntities = this.rigidbodyQuery.refresh().execute({
            updatedComponents: this.world.currentTick,
            updatedValues: this.world.currentTick,
        });
        if (newRigidBodyEntities.size !== 0)
            this._phyStart(newRigidBodyEntities);
        let rigidBodyEntities = this.rigidbodyQuery.refresh().execute();
        this._phyUpdate(scriptEntities, rigidBodyEntities);
    }
    /**
     * @param {Set<Entity>} rbEntities 
     */
    _phyStart(rbEntities) {
        for (let entity of rbEntities) {
            this._initRigidBodyEntity(entity);
        }
    }
    /**
    * @param {Entity} entity 
    */
    _initRigidBodyEntity(entity) {
        let rigidBody = entity.getOne("RigidBody");
        this._initRB(rigidBody, entity)
    }
    /**
     * @param {RigidBody} rb
     * @param {Entity} entity 
     */
    _initRB(rb, entity) {
        try {
            this._validateRigidBodyData(rb, entity.id);
        }
        catch (error) {
            console.error(error);
            rb.isKinematic = false;
            return
        }
        try {
            rb.volume = this._getRbVolume(rb.geometry, entity.id);
            rb.density = rb.mass / rb.volume;
            this._initialTensor(rb);
            rb.position = entity.getOne("Transform").obj.position.clone();
            rb.rotation = entity.getOne("Transform").obj.quaternion.clone();
        }
        catch (e) {
            throw new RigidBodyArithmaticError(e);
        }
    }

    _phyUpdate(scriptEntities, phyEntities) {
        this._fixedUpdate(scriptEntities);
        this._updateRigidBodyEntities(phyEntities);
    }

    _fixedUpdate(entities) {
        entities.forEach(scriptEntity => {
            let scriptComponents = scriptEntity.getComponents('Script');
            scriptComponents.forEach(scriptComponent => {
                try {
                    scriptComponent.script.fixedUpdate(this.clock.getElapsedTime(), this.world.fixedDeltaTime);
                }
                catch (e) {
                    console.error(e);
                    console.error('Your script generated an error it will not update');
                }
            });
        });
    }
    /**
     * 
     * @param {Set<Entity>} entities 
     */
    _updateRigidBodyEntities(entities) {
        for (const entity of entities) {
            this._updateRigidBodyEntity(entity)
        }
    }
    /**
    * @param {Entity} entity
    */
    _updateRigidBodyEntity(entity) {
        let rb = entity.getOne("RigidBody");
        this._updateBody(rb, this.world.fixedDeltaTime)
    }
    /**
     * 
     * @param {RigidBody} rb 
     */
    _updateBody(rb, dt) {
        let transform = rb.entity.getOne("Transform").obj;

        if (rb.recalculateInertia){
            this._initialTensor(rb)
            rb.recalculateInertia = false
        }

        rb.position = transform.position.clone();
        rb.rotation = transform.quaternion.clone();

        if (rb.isKinematic && !(rb.mass === 0)) {
            this.updateBodyVelocity(rb, dt);
            this.updateBodyAngularVelocity(rb, dt)
        }

        rb.totalForce = new THREE.Vector3(0, 0, 0);
        rb.totalTorque = new THREE.Vector3(0, 0, 0);

        transform.position.copy(rb.position);
        transform.quaternion.copy(rb.rotation);
        transform.quaternion.normalize();
    }

    /**
     * this is what unity uses, better approximation exist
     * @param {RigidBody} body 
     * @param {Number} dt 
     * @returns {undefined}
     */
    updateBodyDragApprox(vel, drag, dt) {
        if (drag < EPSILON)
            return;
        vel.multiplyScalar(clamp(1 - dt * drag, 0, 1));
    }
    
    updateBodyDragPrecise(vel, drag, dt) {
        if (drag < EPSILON)
            return;
        vel.multiplyScalar(Math.exp(-dt * drag));
    }


    updateBodyVelocity(body, dt) {
        /**
         * @type {THREE.Vector3}
         */
        let acceleration = body.totalForce.clone().divideScalar(body.mass);
        if (body.affectedByGravity) {
            acceleration.add(this.world.gravity)
        }
        body.velocity.add(acceleration.clone().multiplyScalar(dt));
        this.updateBodyDragPrecise(body.velocity, body.drag, dt)
        this.updateBodyPosition(body, dt);

    }


    updateBodyAngularVelocity(body, dt) {

        // current rotation of body in Matrix3 form
        let rotation = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(body.rotation));
        reorthogonalize(rotation);

        // current inverse inertia tensor of body I^-1 = Rotation * I0^-1 Rotation^T
        let RI = new THREE.Matrix3();
        RI.multiplyMatrices(rotation, body.initialInvInertia);
        let RTranspose = rotation.clone().transpose();
        let RIRt = new THREE.Matrix3();
        RIRt.multiplyMatrices(RI, RTranspose);
        body.invInertia.copy(RIRt);

        // Angular acceleration Alpha = T / I = T * I^-1
        let angularAcceleration = new THREE.Vector3();
        angularAcceleration.copy(body.totalTorque).applyMatrix3(RIRt);

        // adding change in angular velocity: delta omega = alpha * dt
        // omega += delta omega
        let omega = new THREE.Vector3();
        omega.copy(body.angularVelocity);
        omega.add(angularAcceleration.multiplyScalar(dt))
        this.updateBodyDragPrecise(omega, body.angularDrag, dt)
        body.angularVelocity.copy(omega);

        // update the body quaternion
        // dq/dt = omega * dt * 0.5
        body.rotation.multiply(this.deltaRotationAppx1(omega, dt));
        body.rotation.normalize()
    }

    deltaRotationAppx1(em, deltaTime) {
        let ha = em.clone().multiplyScalar(deltaTime * 0.5);
        return new THREE.Quaternion(ha.x, ha.y, ha.z, 1.0);
    }

    deltaRotationAppx2(em, deltaTime) {
        let ha = em.clone().multiplyScalar(deltaTime * 0.5);
        let l = ha.length()
        if (l > 0) {
            ha.multiplyScalar(Math.sin(l) / l);
        }
        return new THREE.Quaternion(ha.x, ha.y, ha.z, Math.cos(l));
    }

    updateBodyPosition(body, dt) {
        body.position.add(body.velocity.clone().multiplyScalar(dt));
    }

    updateBodyRotation(body, dt) {

    }
    /**
     * 
     * @param {RigidBody} rb 
     */
    _initialTensor(rb) {
        /**
         * @type {THREE.BufferGeometry}
         */
        let geo = rb.geometry;
        /**
         * @type {Number}
         */
        let density = rb.density;

        let massCenter = new THREE.Vector3(0, 0, 0);

        let Ia = 0.0, Ib = 0.0, Ic = 0.0,
            Iap = 0.0, Ibp = 0.0, Icp = 0.0;

        let positions = geo.attributes.position;
        let faces = positions.count / 3;

        let point1 = new THREE.Vector3(),
            point2 = new THREE.Vector3(),
            point3 = new THREE.Vector3();

        let mass = 0;
        for (let i = 0; i < faces; i++) {
            point1.fromBufferAttribute(positions, i * 3);
            point2.fromBufferAttribute(positions, i * 3 + 1);
            point3.fromBufferAttribute(positions, i * 3 + 2);

            let tetraVolume = this._signedTetrahedronVolume(point1, point2, point3);
            let tetraMass = density * tetraVolume;

            let tetraMassCenter = new THREE.Vector3();

            tetraMassCenter = tetraMassCenter.add(point1).add(point2).add(point3);

            tetraMassCenter.divideScalar(4.0);

            let V100 = this._tetraInertiaMoment(point1.x, point2.x, point3.x);
            let V010 = this._tetraInertiaMoment(point1.y, point2.y, point3.y);
            let V001 = this._tetraInertiaMoment(point1.z, point2.z, point3.z);

            let determinant = this._determinant(point1, point2, point3);

            Ia += determinant * (V010 + V001);
            Ib += determinant * (V100 + V001);
            Ic += determinant * (V100 + V010);
            Iap += determinant * this._tetraIntertiaProduct(point1.y, point2.y, point3.y, point1.z, point2.z, point3.z);
            Ibp += determinant * this._tetraIntertiaProduct(point1.x, point2.x, point3.x, point1.y, point2.y, point3.y);
            Icp += determinant * this._tetraIntertiaProduct(point1.x, point2.x, point3.x, point1.z, point2.z, point3.z);

            tetraMassCenter.multiplyScalar(tetraMass);
            massCenter.add(tetraMassCenter);
            mass += tetraMass;
        }
        massCenter.divideScalar(mass);
        Ia = density * Ia / 60.0 - mass * (massCenter.y ** 2 + massCenter.z ** 2);
        Ib = density * Ib / 60.0 - mass * (massCenter.x ** 2 + massCenter.z ** 2);
        Ic = density * Ic / 60.0 - mass * (massCenter.x ** 2 + massCenter.y ** 2);
        Iap = density * Iap / 120.0 - mass * (massCenter.y * massCenter.z);
        Ibp = density * Ibp / 120.0 - mass * (massCenter.x * massCenter.y);
        Icp = density * Icp / 120.0 - mass * (massCenter.x * massCenter.z);

        let tensor = new Array(9);
        tensor[0] = Ia;
        tensor[4] = Ib;
        tensor[8] = Ic;
        tensor[1] = tensor[3] = -Ibp;
        tensor[2] = tensor[6] = -Icp;
        tensor[5] = tensor[7] = -Iap;

        rb.centerOfMass = massCenter.clone();
        rb.initialInertiaTensor = new THREE.Matrix3().set(...tensor);
        rb.initialInvInertia = rb.initialInertiaTensor.clone().invert();

        geo.translate(-rb.centerOfMass.x, -rb.centerOfMass.y, -rb.centerOfMass.z)

    }

    /**
     * 
     * @param {RigidBody} rb 
     * @param {Number} entityID 
     */
    _validateRigidBodyData(rb, entityID) {
        if (!rb.geometry.isBufferGeometry || rb.geometry.index) {
            throw new RigidBodyDataError(
                [
                    "'geometry' must be a non indexed buffer geometry\n",
                    "Componnet Message: rigidBody Geomatry is invalid\n",
                    "entity: " + entityID
                ]
            );
        }
        if (rb.position === undefined) {
            rb.position = new THREE.Vector3();
        }
        if (!rb.position.isVector3) {
            throw new RigidBodyDataError();
        }
        if (rb.rotation === undefined) {
            rb.rotation = new THREE.Quaternion();
        }
        if (!rb.rotation.isQuaternion) {
            throw new RigidBodyDataError("Only Quaternion for rigidbody rotations is supported")
        }

        rb.velocity = new THREE.Vector3();
        rb.angularVelocity = new THREE.Vector3();
    }

    _tetraIntertiaProduct(x0, x1, x2, y0, y1, y2) {
        let Result = 2.0 * x0 * y0 + x1 * y2 + x2 * y1
            + 2.0 * x1 * y1 + x0 * y2 + x2 * y0
            + 2.0 * x2 * y2 + x0 * y1 + x1 * y0;
        return Result;
    }

    _tetraInertiaMoment(x0, x1, x2) {
        let result = x0 * x0 + x1 * x2
            + x1 * x1 + x0 * x2
            + x2 * x2 + x0 * x1;
        return result;
    }

    _determinant(p1, p2, p3) {
        let p2CrossP3 = p2.clone().cross(p3);
        return p1.dot(p2CrossP3);
    }
    /**
     * 
     * @param {THREE.Vector3} p1 
     * @param {THREE.Vector3} p2 
     * @param {THREE.Vector3} p3 
     * @returns 
     */
    _signedTetrahedronVolume(p1, p2, p3) {
        let p2CrossP3 = p2.clone().cross(p3);
        return p1.dot(p2CrossP3) / 6.0;
    }
    /**
     * 
     * @param {THREE.BufferGeometry} geometry 
     * @param {Number} entityID 
     * @returns {Number}
     */
    _getRbVolume(geometry) {

        let position = geometry.attributes.position;
        let volume = 0;

        let point1 = new THREE.Vector3(),
            point2 = new THREE.Vector3(),
            point3 = new THREE.Vector3();

        let faces = position.count / 3;
        for (let i = 0; i < faces; i++) {

            point1.fromBufferAttribute(position, i * 3);
            point2.fromBufferAttribute(position, i * 3 + 1);
            point3.fromBufferAttribute(position, i * 3 + 2);

            volume += this._signedTetrahedronVolume(point1, point2, point3);
        }
        return volume;
    }
}

export default PhysicsSystem;