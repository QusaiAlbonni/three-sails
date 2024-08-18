import Behavior from "./base";
import * as THREE from 'three'

class BoxBehavior extends Behavior{
    start(){
        this.transform.position.x = 0
        this.transform.position.y = -10;
    }

    fixedUpdate(){
        this.body.addForce(new THREE.Vector3(1.0, 0, 0))
        this.body.addForce(new THREE.Vector3(10.0, 0, 0))
        
    }
    get body(){
        return this.entity.c.rigidBody;
    }
}

export default BoxBehavior;