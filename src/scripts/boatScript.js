import Behavior from "./base";
import * as THREE from "three";
import { wind } from "../wind";
import { signedAngle, rotateVectorAroundAxis, isRotationExceedingAngle } from "../utils"

class BoatBehavior extends Behavior {

	headSailArea = 30;
	mainSailArea = 40;

	mainSailCenter = new THREE.Vector3(0, 0.5, 0);
	headSailCenter = new THREE.Vector3(0, 0.5, 0.1);
	keelCenter     = new THREE.Vector3(0, -0.2, 0.1);
	underWaterVolume= 6
	boatLength = 6

	windVector = new THREE.Vector3()

	airDensity = 1.293;

	constructor(water) {
		super();
		this.water = water;
	}

	start() {

		console.log(this.body);
		
		let velocity = this.body.velocity
		
		this.transform.position.y = 0.2
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
					min: 0.0,
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
					name: "Head Sail Area"

				},
				{
					path: ["boat", "Rigid Body", "v"],
					guiType: "vector",
					properityName: "velocity",
					target: velocity,
					name: "v",
					min: {
						x: 0.0,
						y: 0.0,
						z: 0.0,
					},
					max: {
						x:100.0,
						y:100.0,
						z:100.0,
					},
					step: {
						x: 0.1,
						y:0.1,
						z:0.1,
					},
					name: {
						x: "x",
						y: "y",
						z: "z"
					}

				},
				{
					path: ["wind"],
					guiType: "slider",
					properityName: "airDensity",
					target: this,
					max: 100,
					min: 0.1,
					step: 0.01,
					name: "Air Density"

				},
			],
		})

		
		this.initCoeficients()

		this.transform.position.y = 0.1
		this.transform.updateMatrix()
		this.transform.updateWorldMatrix(true, true)		

		this.mesh.traverse(((obj) => {
			if (obj.name === 'rudder')
				this.rudder = obj
			if (obj.name === 'jib')
				this.jib = obj
			if (obj.name === 'mainsail')
				this.mainsail = obj
		}).bind(this))

		const color = 0xff0000;
		// Create the arrow helper
		this.arrowHelper = new THREE.ArrowHelper(this.windVector, this.transform.position, 3, color);

		// Add the arrow helper to the scene
		this.scene.add(this.arrowHelper);

		const col = 0x00ff00

		this.keelHelper = new THREE.ArrowHelper(this.windVector, this.transform.position, 5, col);

		// Add the arrow helper to the scene
		this.scene.add(this.keelHelper);


		this.totalForceHelper = new THREE.ArrowHelper(this.windVector, this.transform.position, 5, 0x0000ff);

		// Add the arrow helper to the scene
		this.scene.add(this.totalForceHelper);
	}
	fixedUpdate() {
		this.arrowHelper.setDirection(wind.getWindVector())
		this.arrowHelper.position.copy(this.transform.position)
		this.keelHelper.position.copy(this.transform.position)
		this.totalForceHelper.position.copy(this.transform.position)


		this.addSailForce(this.mainSailArea, this.mainSailCenterWorld, this.mainsail)
		this.addSailForce(this.headSailArea, this.headSailCenterWorld, this.jib)
		this.addKeelForce()


		console.log(this.body.velocity.length());
		
		
		let helperDirection = this.body.totalForce.clone()
		helperDirection.y = 0
		helperDirection.normalize()
		this.totalForceHelper.setDirection(helperDirection)
		
		if (isRotationExceedingAngle(this.mesh, 'x', Math.PI / 2) || isRotationExceedingAngle(this.mesh, 'y', Math.PI / 2) || isRotationExceedingAngle(this.mesh, 'z', Math.PI / 2))
			this.body.mass += 100

		
	}

	addSailForce(sailArea, forcePos, mesh) {
		let apparentWind = this.apparentWindVector
		let sailVector = mesh.forwardVector
		let windVelocity = this.apparentWindVector.length()

		let sailAppraentAngleGrad = this.getSailApparentAngleGrad(sailVector, apparentWind)
		let liftCoeficient = this.getHeadSailLiftCoeficientAtAngle(sailAppraentAngleGrad)
		let dragCoeficient = this.getHeadSailDragCoeficientAtAngle(sailAppraentAngleGrad)

		

		let liftDirection = this.getLiftDirection(apparentWind, sailVector)
		let Fl = liftDirection.clone().multiplyScalar(this.sailForce(liftCoeficient, windVelocity, sailArea))
		let Fd = apparentWind.clone().normalize().multiplyScalar(this.sailForce(dragCoeficient, windVelocity, sailArea))
		let F = Fl.clone().add(Fd)
		
		this.body.addForceAtPosition(F, forcePos)
	}

	addKeelForce() {
		let v = this.body.velocity
		let cos = v.clone().dot(this.transform.rightVector)
		let angle = -90 * Math.sign(cos)
		let direction = rotateVectorAroundAxis(this.body.velocity, angle)
		let Fk = direction.clone().multiplyScalar(2 * cos * cos * this.waterDensity)
		this.keelHelper.setDirection(Fk.clone().normalize())
		this.body.addForceAtPosition(Fk, this.keelCenterWorld)
	}


	getLiftDirection(apparentWind, objVector) {
		new THREE.Vector3().normalize
		let angle = signedAngle(apparentWind.clone().normalize().multiplyScalar(-1), objVector.clone().normalize(), new THREE.Vector3(0, 1, 0));
		angle += 180
		if (Math.abs(angle) < 180) {
			angle = -90 * Math.sign(angle)
		}
		else {
			angle = 90 * Math.sign(angle)
		}
		let direction = rotateVectorAroundAxis(apparentWind, angle)

		return direction
	}

	sailForce(C, v, A) {
		return 0.5 * this.airDensity * v * v * A * C
	}


	addHullDrag(){
		let speed = this.body.velocity.clone().dot(this.transform.rightVector)
		let Cd = 0.25
		let factor = speed * speed * Cd * this.waterDensity
		factor = -factor
		let force = this.body.velocity.clone().normalize().multiplyScalar(factor)
		this.body.addForce(force)
		let torque = this.body.angularVelocity.clone().normalize().multiplyScalar(factor)
		this.body.addTorque(torque)	
	}

	addFricionalResistence(){
		let Cf = 0.004
		let S = 2.6 * Math.sqrt(this.underWaterVolume * this.boatLength);
		let Ffr = 0.5 * this.waterDensity * Math.pow(this.body.velocity.length(), 2) * S * Cf;
		this.body.addForce(this.body.velocity.clone().normalize().multiplyScalar(-1 * Ffr))
		let torque = this.body.angularVelocity.clone().normalize().multiplyScalar(-1 * Ffr)
		this.body.addTorque(torque)	
	}

	addResidualForce() {
        // Fr = 1/2 * rho * V * V * S * Cr
        let Cr = 2 * Math.exp(-3);
        let Fr = 0.5 * this.waterDensity * Math.pow(this.body.velocity.length(), 2) * Cr;
		this.body.addForce(this.body.velocity.clone().normalize().multiplyScalar(-1 * Fr))
		let torque = this.body.angularVelocity.clone().normalize().multiplyScalar(-1 * Fr)
		this.body.addTorque(torque)	
	}


	get apparentWindVector() {
		return wind.getWindVector().clone().sub(this.body.velocity)
	}
	get body() {
		return this.entity.c.rigidBody;
	}
	get buoy() {
		return this.entity.c.buoyantBody;
	}

	get mainSailCenterWorld() {
		return this.mainSailCenter.clone().applyMatrix4(this.transform.matrixWorld)
	}
	get headSailCenterWorld() {
		return this.headSailCenter.clone().applyMatrix4(this.transform.matrixWorld)
	}
	get keelCenterWorld(){
		return this.keelCenter.clone().applyMatrix4(this.transform.matrixWorld)
	}
	get waterDensity() {
		return this.buoy.fluidDensity
	}

	/*
	*/
	getSailApparentAngleGrad(objVector, windVector) {
		return THREE.MathUtils.radToDeg(objVector.angleTo(windVector.clone().multiplyScalar(-1)))
	}

	getHeadSailLiftCoeficientAtAngle(angle) {
		return this.getCoeficientAtangle(this.headSailLiftCoeficients, angle)
	}
	getMainSailLiftCoeficientAtAngle(angle) {
		return this.getCoeficientAtangle(this.mainSailLiftCoeficients, angle)
	}
	getHeadSailDragCoeficientAtAngle(angle) {
		return this.getCoeficientAtangle(this.headSailDragCoeficients, angle)
	}
	getMainSailDragCoeficientAtAngle(angle) {
		return this.getCoeficientAtangle(this.mainSailDragCoeficients)
	}

	getCoeficientAtangle(array, angle){
		angle = Math.round(angle)
		if (angle < 0)
			return 0
		if (angle > 180)
			return array[360 - angle]
		return array[angle]
	}

	initCoeficients(){
		this.mainSailLiftCoeficients = [-0.05, 0.020883078, 0.092470145, 0.164057211, 0.235644278, 0.307231345, 0.378818412, 0.450405478, 0.504490273, 0.565930411, 0.627370548, 0.688810686, 0.750250824, 0.805642556, 0.853819935, 0.901997314, 0.950174693, 0.998352072, 1.046529451, 1.088761889, 1.130677276, 1.165245295, 1.197876052, 1.228547608, 1.256131425, 1.283715242, 1.294746187, 1.302365856, 1.302408885, 1.300696517, 1.295771298, 1.290846079, 1.2818945, 1.272631861, 1.258578528, 1.242851952, 1.223503499, 1.209775299, 1.196047099, 1.188616161, 1.182037515, 1.175458869, 1.168480788, 1.160250041, 1.15218895, 1.146909313, 1.141629676, 1.13635004, 1.126385357, 1.114030145, 1.101674933, 1.08931972, 1.076964508, 1.064609296, 1.052254083, 1.038540735, 1.02255314, 1.006565545, 0.99057795, 0.974241725, 0.956802971, 0.939364217, 0.921925463, 0.904322536, 0.885322141, 0.866321745, 0.84732135, 0.824191214, 0.800805787, 0.777420361, 0.754034935, 0.730243921, 0.705564708, 0.680885495, 0.656206282, 0.631527069, 0.606847856, 0.582168643, 0.555080611, 0.525492436, 0.495904261, 0.466316086, 0.436100994, 0.405758636, 0.375416278, 0.344186659, 0.312498236, 0.280809813, 0.249333033, 0.218519452, 0.187705871, 0.15526957, 0.119279676, 0.083289781, 0.046613879, 0.005617003, -0.024460955, -0.049140168, -0.069869439, -0.09044886, -0.110993543, -0.130752022, -0.150510501, -0.166515903, -0.180106845, -0.193697787, -0.207288729, -0.220879672, -0.234162472, -0.247341586, -0.260520701, -0.273534762, -0.285117266, -0.29669977, -0.308282274, -0.319864779, -0.331447283, -0.343029787, -0.354612291, -0.365995976, -0.376977284, -0.387958593, -0.398939901, -0.40992121, -0.420902518, -0.431883826, -0.44278009, -0.453651446, -0.464522803, -0.475394159, -0.486265516, -0.497136872, -0.506878711, -0.516141349, -0.525403987, -0.534666625, -0.543929263, -0.553191902, -0.56245454, -0.571717178, -0.580979816, -0.590242454, -0.598481708, -0.606712456, -0.614943203, -0.623344553, -0.63206096, -0.640777368, -0.649493775, -0.658210182, -0.66692659, -0.675642997, -0.684359404, -0.693075812, -0.701792219, -0.710508626, -0.719225034, -0.727941441, -0.745650528, -0.763616722, -0.784783239, -0.813554069, -0.873442789, -0.946688773, -0.994284252, -1.004872848, -1.004280002, -0.988633743, -0.959963118, -0.917563513, -0.867171527, -0.806180985, -0.737089336, -0.661059537, -0.581294014, -0.492326981, -0.396603617, -0.308954542, -0.225154278, -0.123170151, -0.021186024 ]
		this.mainSailDragCoeficients = [ 0.38686385, 0.38686385, 0.38686385, 0.38686385, 0.389313944, 0.392970084, 0.39627427, 0.400844893, 0.406525589, 0.413448441, 0.423087326, 0.43436206, 0.446969015, 0.461843124, 0.477379126, 0.494470073, 0.511844278, 0.530824867, 0.551880783, 0.573473466, 0.595613179, 0.618209053, 0.640621824, 0.662929695, 0.689879447, 0.717907852, 0.742850651, 0.768920302, 0.795362681, 0.823316744, 0.850209803, 0.875819503, 0.902869248, 0.929952637, 0.956062275, 0.982152684, 1.00783812, 1.032219846, 1.056128497, 1.079807038, 1.103792918, 1.126769184, 1.148463259, 1.170392417, 1.191483401, 1.211927291, 1.232460607, 1.251496506, 1.26986412, 1.287926532, 1.305267082, 1.321581271, 1.336975061, 1.352433199, 1.367474706, 1.381879313, 1.395370904, 1.408437175, 1.42077202, 1.432323005, 1.442932234, 1.453247113, 1.463107136, 1.472244833, 1.481002418, 1.48898399, 1.496326908, 1.503874636, 1.510469672, 1.516160814, 1.520762198, 1.524862379, 1.528414588, 1.531505316, 1.534396653, 1.536929303, 1.539348753, 1.541768202, 1.543557613, 1.54546413, 1.547581813, 1.549468654, 1.548920021, 1.54801459, 1.546543847, 1.544999096, 1.543531685, 1.54202705, 1.540196571, 1.538897543, 1.537466191, 1.535683999, 1.53355819, 1.531394771, 1.529080687, 1.52636414, 1.523296284, 1.519923682, 1.516217375, 1.511846219, 1.506802417, 1.501377281, 1.495823772, 1.489852422, 1.483303796, 1.476166382, 1.468601931, 1.46103748, 1.453121688, 1.444432961, 1.435363018, 1.426135009, 1.416626582, 1.4060435, 1.394535499, 1.382541884, 1.370241135, 1.35748521, 1.344036318, 1.329988939, 1.315536648, 1.299903026, 1.283327307, 1.266037303, 1.248179244, 1.229432006, 1.20930074, 1.189087279, 1.166532089, 1.143668855, 1.120641873, 1.095927105, 1.068977914, 1.041870702, 1.012157234, 0.981880102, 0.952218843, 0.92072355, 0.886264821, 0.851341686, 0.81609477, 0.780375363, 0.743510309, 0.705298108, 0.667971289, 0.632315819, 0.598288727, 0.56281104, 0.530969521, 0.499784719, 0.472547329, 0.448385954, 0.425068473, 0.405095466, 0.389551534, 0.377744637, 0.368761857, 0.362676155, 0.358217857, 0.353394115, 0.351457994, 0.353654607, 0.355851219, 0.358047832, 0.360244444, 0.362441057, 0.364637669, 0.366834282, 0.369030894, 0.371227506, 0.373424119, 0.375620731, 0.377817344, 0.380013956, 0.382210569, 0.384407181, 0.386603794, 0.388800406, 0.390997019, 0.393193631, 0.395390244	]
	
		this.headSailLiftCoeficients = Array.from(this.mainSailLiftCoeficients)
		this.headSailDragCoeficients = Array.from(this.mainSailDragCoeficients)
	}
}
export default BoatBehavior;
