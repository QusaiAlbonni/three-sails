import { step } from "three/examples/jsm/nodes/Nodes.js";
import Behavior from "./base";
import * as THREE from "three";
import { wind } from "../wind";
import {signedAngle, rotateVectorAroundAxis} from "../utils"

class BoatBehavior extends Behavior {

	headSailArea = 15;
	mainSailArea = 13;

	mainSailCenter = new THREE.Vector3(0, 6, 0);
	headSailCenter = new THREE.Vector3(0, 6, 1.5);

	airDensity = 1.293;

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
						this.body.recalculateInertia = true
					}.bind(this)
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

				},
				{
					path: ["wind"],
					guiType: "slider",
					properityName: "speed",
					target: wind,
					max: 200,
					min: 1.0,
					step: 0.5,
					name: "Wind Speed"

				},
				{
					path: ["boat"],
					guiType: "slider",
					properityName: "mainSailArea",
					target: this,
					max: 100,
					min: 1.0,
					step: 0.5,
					name: "Main Sail Area"

				},
				{
					path: ["boat"],
					guiType: "slider",
					properityName: "headSailArea",
					target: this,
					max: 100,
					min: 1.0,
					step: 0.5,
					name: "Main Sail Area"

				},
 			],
		})
	}
	fixedUpdate() {
		this.addSailForce(this.mainSailArea)
		this.addSailForce(this.headSailArea)
	}

	addSailForce(sailArea){
		let apparentWind = this.apparentWindVector
		let sailVector = this.transform.forwardVector
		let windVelocity = this.apparentWindVector.length()

		let sailAppraentAngleGrad = this.getSailApparentAngleGrad(this.transform.forwardVector, apparentWind)
		let liftCoeficient= this.getHeadSailLiftCoeficientAtAngle(sailAppraentAngleGrad)
		let dragCoeficient= this.getHeadSailDragCoeficientAtAngle(sailAppraentAngleGrad)

		let liftDirection = this.getLiftDirection(apparentWind, sailVector)
		let Fl = liftDirection.clone().multiplyScalar(this.sailForce(liftCoeficient, this.body.velocity, sailArea))
		let Fd = apparentWind.clone().normalize().multiplyScalar(this.sailForce(dragCoeficient, this.body.velocity, sailArea))

		this.body.addForce(Fl.clone().add(Fd))
	}

	getLiftDirection(apparentWind, objVector){
		new THREE.Vector3().normalize
		let angle = signedAngle(apparentWind.clone().normalize().multiplyScalar(-1), objVector.clone().normalize(), new THREE.Vector3(0, 1, 0));
		if (Math.abs(angle) < 180){
			angle = -90 * Math.sign(angle)
		}
		else {
			angle = 90 * Math.sign(angle)
		}
		let direction = rotateVectorAroundAxis(apparentWind, angle)

		return direction
	}

	sailForce(C, v, A){
		return 0.5 * this.airDensity * v * v * A * C
	}


	get apparentWindVector(){
		return wind.getWindVector().clone().sub(this.body.velocity)
	}
	get body() {
		return this.entity.c.rigidBody;
	}
	get buoy() {
		return this.entity.c.buoyantBody;
	}

	get mainSailCenterWorld(){
		return this.transform.localToWorld(this.mainSailCenter)
	}
	get headSailCenterWorld(){
		return this.transform.localToWorld(this.headSailCenter)
	}
	get waterDensity(){
		return this.buoy.fluidDensity
	}

	/*
	*/
	getSailApparentAngleGrad(objVector, windVector){
		return objVector.angleTo(windVector.clone().multiplyScalar(-1))
	}

	getHeadSailLiftCoeficientAtAngle(angle){
		return 1.0;
	}
	getMainSailLiftCoeficientAtAngle(angle){
		return 1.0;
	}
	getHeadSailDragCoeficientAtAngle(angle){
		return 0.5;
	}
	getMainSailDragCoeficientAtAngle(angle){
		return 0.5;
	}
}
export default BoatBehavior;
