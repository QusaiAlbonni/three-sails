import Behavior from "./base";
import * as THREE from 'three'

class MountainBehavior extends Behavior{
    start(){
        this.transform.position.z = 450
        this.transform.rotation.y=-90
    }

    fixedUpdate(){
 
        
    }
     
}

export default MountainBehavior;