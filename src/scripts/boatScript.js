import { step } from "three/examples/jsm/nodes/Nodes.js";
import Behavior from "./base";
import * as THREE from "three";

class BoatBehavior extends Behavior {
	constructor(water) {
		super();
		this.water = water;
	}

	start() {
		this.transform.position.y= 2
		this.entity.addComponent({
			type: 'GUIcomponent',
			list: [
 				{
 					path: ["boat", "Rigid Body"],
 					guiType: "slider",
 					properityName: "mass",
 					target: this.body,
 					max: 50000,
 					min: 0,
 					step: 1,
 					name: "mass",
					onChange: function (value) {
						console.log('dasd');
						this.body.update({mass: value});
					}
 				},
				{
					path: ["boat", "Bouyancy"],
					guiType: "slider",
					properityName: "minimumWaterDrag",
					target: this.buoy,
					max: 10,
					min: 0.001,
					step: 0.01,
					name: "Minimum Drag"

				},
				{
					path: ["boat", "Bouyancy"],
					guiType: "slider",
					properityName: "minimumWaterAngularDrag",
					target: this.buoy,
					max: 10,
					min: 0.001,
					step: 0.01,
					name: "Minimum angular Drag"

				},
				{
					path: ["boat", "Bouyancy"],
					guiType: "slider",
					properityName: "fluidDensity",
					target: this.buoy,
					max: 10000,
					min: 1.0,
					step: 0.5,
					name: "Fluid Density"

				}
 			],
		})
	}
	fixedUpdate() {
		//this.transform.position.y = this.water.getHeightAtPos(new THREE.Vector2(this.transform.position.x, this.transform.position.z)) + 2;
		
	}


	get body() {
		return this.entity.c.rigidBody;
	}
	get buoy() {
		return this.entity.c.buoyantBody;
	}
}
export default BoatBehavior;
