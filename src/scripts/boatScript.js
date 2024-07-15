import Behavior from "./base";
import * as THREE from "three";

class BoatBehavior extends Behavior {
  constructor(water){
    super();
    this.water = water;
  }

  start() {
    
  }
  fixedUpdate() {
    this.transform.position.y = this.water.getHeightAtPos(new THREE.Vector2(this.transform.position.x, this.transform.position.z));  
  }
}
export default BoatBehavior;
