import Behavior from "./base";
import * as THREE from 'three'

class BoxBehavior extends Behavior{
    start(){
        this.transform.position.x = -3;
    }

    update(){
        this.transform.position.x +=0.01;
    }
}

export default BoxBehavior;