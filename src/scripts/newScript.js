import Behavior from "./base";
import * as THREE from 'three'

class NewScript extends Behavior {
    start() {
        this.transform.position.y = 10
        const geo = new THREE.BoxGeometry();
        const mat = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        this.mesh.material = mat;


    }
    fixedUpdate(time, dt) {
        this.rigidbody.addForceAtPosition(new THREE.Vector3(1.2, 0, -31.5), new THREE.Vector3(0, 1, 0))
    }
    get rigidbody() {
        return this.entity.c.rigidBody;
    }
    
}

export default NewScript;