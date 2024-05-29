import Behavior from "./base";
import * as THREE from 'three'

class BoxBehavior extends Behavior{
    start(){
        this.transform.position.x = -26
        this.transform.position.y = 4;
    }

    update(){
        this.transform.position.x +=0.1;
    }
}

export default BoxBehavior;