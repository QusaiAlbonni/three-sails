import * as THREE from "three";
import Rudder from "./scripts/rudder";
import {
	EffectComposer,
	BloomEffect,
	EffectPass,
	FXAAEffect,
	SSAOEffect,
} from "postprocessing";
import { loadModel } from "./utils";
import VoxelizedMesh from "./voxelizedmesh";
import { Sky } from "three/addons/objects/Sky.js";
import Water from "./water";
import {
	WaterBehavior,
	CameraBehavior,
	NewScript,
	SkyBehavior,
	BoxBehavior,
	BoatBehavior,
} from "./scripts/behaviors";
import boatModel from "../assets/models/boat/boat.glb";
import phyBoatModel from "../assets/models/boat/boatphy.glb";
const renderer = new THREE.WebGLRenderer({
	powerPreference: "high-performance",
});
const mainScene = new THREE.Scene();
const composer = new EffectComposer(renderer);
const mainCamera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

const gameRenderEntity = {
	tags: ["MainGameRender"],
	c: {
		gameRender: {
			type: "GameRender",
			renderer: renderer,
			scene: mainScene,
			composer: composer,
		},
	},
};

const geo = new THREE.BoxGeometry(1, 1, 1);
const nonIndexGeo = geo.toNonIndexed();
const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geo, mat);

const boxEntity = {
	c: {
		meshFilter: {
			type: 'MeshFilter',
			mesh: mesh,
			scene: mainScene
		},
		transform: {
			type: 'Transform',
			obj: mesh
		},
		script: {
			type: 'Script',
			script: new BoxBehavior()
		},
		rigidBody: {
			type: 'RigidBody',
			geometry: nonIndexGeo,
			mass: 5
		}
		,
		gui: {
			type: "GUIcomponent",
			list: [
				{
					path: ["BoxPosition"],
					guiType: "vector",
					target: mesh.position,
					max: {
						x: 10,
						y: 20,
						z: 30,
					},
					min: {
						x: -10,
						y: -20,
						z: -30,
					},
					step: {
						x: 1,
						y: 1,
						z: 1,
					},
					name: {
						x: "X",
						y: "Y",
						z: "Z",
					},
					onchange: {
						x: () => { console.log("x") },
						y: () => { console.log("y") },
						z: () => { console.log("z") },
					}
				}
			]
		}
	}
};

const cameraEntity = {
	tags: ["MainCamera"],
	c: {

		camera: {
			type: "CameraComponent",
			camera: mainCamera,
		},
		transform: {
			type: "Transform",
			obj: mainCamera,
		},
		script: {
			type: "Script",
			script: new CameraBehavior(),
		},
	},
};


const bloomEffect = new BloomEffect({ intensity: 0.0 });
const bloomPass = new EffectPass(mainCamera, bloomEffect);
const fxaaPass = new EffectPass(mainCamera, new FXAAEffect());

const postProcessingEntity = {
	c: {
		bloom: {
			type: "PassComponent",
			pass: bloomPass,
			composer: composer,
		},
		fxaa: {
			type: "PassComponent",
			pass: fxaaPass,
			composer: composer,
		},
		// ssao: {
		// 	type: "PassComponent",
		// 	pass: new EffectPass(mainCamera, new SSAOEffect(mainCamera, mainScene)),
		// },
	},
};

const sky = new Sky();

const skyEntity = {
	c: {
		meshFilter: {
			type: "MeshFilter",
			mesh: sky,
			scene: mainScene,
		},
		transform: {
			type: "Transform",
			obj: sky,
		},
		script: {
			type: "Script",
			script: new SkyBehavior(),
		},
	},
};

const me = new THREE.Mesh(nonIndexGeo, mat);
nonIndexGeo.scale(10, 10, 10);

// const exampleBoxEntity = {
// 	c: {
// 		meshFilter: {
// 			type: "MeshFilter",
// 			mesh: me,
// 			scene: mainScene,
// 		},
// 		script: {
// 			type: "Script",
// 			script: new NewScript(),
// 		},
// 		transform: {
// 			type: "Transform",
// 			obj: me,
// 		},
// 		gui: {
// 			type: "GUIcomponent",
// 			list: [
// 				{
// 					path: [""],
// 					guiType: "slider",
// 					properityName: "x",
// 					target: me.position,
// 					max: 3,
// 					min: -3,
// 					step: 0.1,
// 					name: "X-Axis",
// 				},
// 			],
// 		},
// 		script: {
// 			type: "Script",
// 			script: new NewScript(),
// 		},
// 		transform: {
// 			type: "Transform",
// 			obj: me,
// 		},
// 		rigidBody: {
// 			type: "RigidBody",
// 			geometry: nonIndexGeo,
// 			mass: 55,
// 			affectedByGravity: false,
// 			drag: 0.5,
// 			angularDrag:0.5
// 		},
// 	},
// };

const boat = await loadModel(boatModel);

var rudder;
boat.traverse((obj) => {
	if (obj.name === 'rudder')
		rudder = obj
})


const water = new Water(65, 4000000, 14000000,undefined, boat);
const waterEntity = {
	c: {
		meshFilter: {
			type: "MeshFilter",
			mesh: water,
			scene: mainScene,
		},
		transform: {
			type: "Transform",
			obj: water,
		},
		script: {
			type: "Script",
			script: new WaterBehavior(),
		}
	}
};


const phyBoat = await loadModel(phyBoatModel);
var phyBoatIndGeo;
var phyBoatVoxelMesh;
phyBoat.traverse(function (child) {
	if (child.isMesh) {
		const geometry = child.geometry;
		const material = child.material;
		console.log(geometry);
		console.log('Number of vertices:', geometry.attributes.position.count);
		phyBoatIndGeo = geometry;
		phyBoatVoxelMesh = child
	}
});

const voxy = new VoxelizedMesh(phyBoatVoxelMesh, 0.5, 0.5, {x: 0.0, y:0.0, z:0.0}, new THREE.MeshLambertMaterial({color: 0x00ff00}))
phyBoatVoxelMesh= voxy.voxelMesh
const phyBoatNonIndGeo = phyBoatIndGeo.toNonIndexed()
boat.position.y=3;
const boatEntity = {
	tags: ["objectToBeFollowed"],
	c: {
		meshFilter: {
			type: "MeshFilter",
			mesh: boat,
			scene: mainScene,
		},
		transform: {
			type: "Transform",
			obj: boat,
		},
		rigidBody: {
		  type: "RigidBody",
		  geometry: phyBoatNonIndGeo,
		  mass: 10000,
		  affectedByGravity: true,
		},
		buoyantBody: {
			type: "BuoyantBody",
			voxelizedMesh: voxy,
			water: water,
			drawVoxels: true
		},
		script: {
			type: "Script",
			script: new BoatBehavior(water),
		},
	},
};

const basicMesh = new THREE.Mesh(geo, mat);
basicMesh.position.set(0, 0, 0);
mainCamera.position.x = basicMesh.position.x;
mainCamera.position.z = basicMesh.position.z - 30;
mainCamera.position.y = basicMesh.position.y + 5;
const invisibleMeshEntitiy = {
	tags: ["Follower"],
	c: {
		transform: {
			type: "Transform",
			obj: basicMesh,
		}
	}
}
rudder.geometry.translate(0,0,3)
const amEntity = {
  c: {
    //   meshFilter: {
    //      type: "MeshFilter",
    //      mesh: rudder,
    //      scene: mainScene,
    //   },
      transform: {
          type: "Transform",
          obj: rudder,
      },
      script: {
          type: "Script",
          script: new Rudder(rudder),
      },
	//   rigidBody: {
	// 	type: 'RigidBody',
	// 	geometry: rudder.geometry,
	// 	mass: 1,
	// 	affectedByGravity:0
	// },
    }
  };
const entities = [
	gameRenderEntity,
	boxEntity,
	cameraEntity,
	postProcessingEntity,
	skyEntity,
	waterEntity,
	boatEntity,
	amEntity,
	invisibleMeshEntitiy,
];

export { entities };
