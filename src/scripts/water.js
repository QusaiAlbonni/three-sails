import { Vector2 } from "three";
import Behavior from "./base";

class WaterBehavior extends Behavior{
    start(){

    }
    update(time){
        this.mesh.update(time);
    }
}

export default WaterBehavior;