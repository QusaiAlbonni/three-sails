import Behavior from "./base";
import { Vector3 } from "three";

class CameraBehavior extends Behavior {
    start() {
        this.transform.position.z = 50;
        this.transform.position.y = 20;
        this.transform.lookAt(new Vector3(0, 0, 0))
    }
}


export default CameraBehavior