import Behavior from "./base";
import * as THREE from 'three'

class NewScript extends Behavior {
    rotation = new THREE.Matrix3();
    L = new THREE.Vector3(0.0, -0.0, 0.0);
    T = new THREE.Vector3(0.0, -1.0, 0.0);
    start() {
        this.transform.position.y = 8
        const geo = new THREE.BoxGeometry();
        const mat = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        this.mesh.material = mat;


    }
    fixedUpdate(time, dt) {
        this.rigidbody.addForceAtPosition(new THREE.Vector3(0.0, 0.0, 1.0), new THREE.Vector3(1.0, 8.0, 0.0))
    }
    get rigidbody() {
        return this.entity.c.rigidBody;
    }
    
}

export default NewScript;