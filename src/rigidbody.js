import { Component } from "ape-ecs";
import { Vector3, Matrix3, BoxGeometry } from "three";
import { EPSILON } from "./utils";

class RigidBody extends Component {
    totalForce          = new Vector3();
    totalTorque         = new Vector3();
    centerOfMass        = new Vector3();
    inertiaTensor       = new Matrix3();
    initialInertiaTensor= new Matrix3();
    invInertia          = new Matrix3();
    initialInvInertia   = new Matrix3();
    velocity            = new Vector3();
    angularVelocity     = new Vector3();
    density             = 0;
    volume              = 0;


    static properties = {
        geometry: new BoxGeometry(),
        position: undefined,
        rotation: undefined,
        mass: 0,
        isKinematic: true,
        affectedByGravity: true,
        drag: 0,
        angularDrag: 0,
        recalculateInertia: false,
    }


    get inertiaTensor(){
        return this.invInertia.clone().invert()
    }

    addForce(force) {
        if (force.length() < EPSILON || force.length() > 1e6) {
            return
        }
        this.totalForce.add(force);

    }
    /**
     * 
     * @param {Vector3} force 
     * @param {Vector3} position 
     * @returns 
     */
    addForceAtPosition(force, position) {
        if (force.length() < EPSILON || force.length() > 1e6)
            return
        this.totalForce.add(force);
        let arm = position.clone().sub(this.position.clone());
        let torque = new Vector3().crossVectors(arm, force)
        if (torque.length() < EPSILON)
            return
        this.totalTorque.add(torque);
    }
    addTorqueFromForce(force, position) {
        if (force.length() < EPSILON || force.length() > 1e6)
            return
        let arm = position.clone().sub(this.position.clone());
        let torque = new Vector3().crossVectors(arm, force)
        if (torque.length() < EPSILON)
            return
        this.totalTorque.add(torque);
    }
    addTorque(torque){
        if(torque.length() < EPSILON || torque.length() > 1e6)
            return
        this.totalTorque.add(torque);
    }
}

export default RigidBody;