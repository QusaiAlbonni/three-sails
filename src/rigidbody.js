import { Component } from "ape-ecs";
import { Vector3, Matrix3, BufferGeometry, BoxGeometry } from "three";

class RigidBody extends Component {
    static properties = {
        geometry: new BoxGeometry(),
        position: undefined,
        rotation: undefined,
        centerOfMass: new Vector3(),
        inertiaTensor: new Matrix3(),
        initialInertiaTensor: new Matrix3(),
        invInertia: new Matrix3(),
        initialInvInertia: new Matrix3(),
        velocity: new Vector3(),
        angularVelocity: new Vector3(),
        mass: 0,
        volume: 0,
        density: 0,
        isKinematic: true,
        totalForce: new Vector3(),
        totalTorque: new Vector3(),

    }

    addForce(force) {
        if (force.length() < 1e-8) {
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
        if (force.length() < 1e-8) {
            return
        }
        let arm = position.clone().sub(this.position);
        this.totalForce.add(force);
        this.totalTorque.add(new Vector3().crossVectors(arm, force));
    } 
}

export default RigidBody;