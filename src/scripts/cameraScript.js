import Behavior from "./base";
import { Vector3 } from "three";

class CameraBehavior extends Behavior {
    start() {
        this.transform.position.z = 10;
        this.transform.position.y = 160;
        this.transform.lookAt(new Vector3(0, 0, 0))
    }
}


export default CameraBehavior