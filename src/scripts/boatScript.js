import Behavior from "./base";
import * as THREE from "three";

class BoatBehavior extends Behavior {
  start() {
    this.transform.position.y=5;
  }
  fixedUpdate() {
    this.transform.position.y+=0.9;
  }
}
export default BoatBehavior;
