import Behavior from "./base";
import * as THREE from 'three'

class NewScript extends Behavior {
    start() {
        this.transform.position.x = -8
        const geo = new THREE.BoxGeometry();
        const mat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        this.mesh.material = mat;
        this.mesh.geometry = geo;
    }
    update() {
        this.transform.position.x += 0.01;
    }
}

export default NewScript;