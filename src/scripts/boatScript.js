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
    this.transform.position.y = this.water.getHeightAtPos(new THREE.Vector2(this.transform.position.x, this.transform.position.z)) + 2;  
  }
  
  get body(){
    return this.entity.c.rigidBody;
  }
}
export default BoatBehavior;
