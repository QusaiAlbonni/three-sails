import Behavior from "./base";
import * as THREE from 'three'

class NewScript extends Behavior {
    start() {
        this.transform.position.x = -26
        this.transform.position.y = 8
        const geo = new THREE.BoxGeometry();
        const mat = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        this.mesh.material = mat;
        this.mesh.geometry = geo;
    }
    fixedUpdate(time, dt) {
        this.transform.position.x += 0.1;
    }
}

export default NewScript;