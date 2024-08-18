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
	CloudBehavior,
	MountainBehavior,
} from "./scripts/behaviors";
import boatModel from "../assets/models/boat/boat.glb";
import islandModel from "../assets/models/extra/untitled4.glb";
import mountainModel from "../assets/models/extra/mountain.glb";
import beaconModel from "../assets/models/extra/beacon.glb";
import phyBoatModel from "../assets/models/boat/boatphy.glb";
import MainSailControls from "./scripts/mainsail";
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


const bloomEffect = new BloomEffect({ intensity: 0.9 });
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
		//ssao: {
		//	type: "PassComponent",
		//	pass: new EffectPass(mainCamera, new SSAOEffect(mainCamera, mainScene)),
		//},
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
const cloudEntity = {
	c: {
	  meshFilter: {
		type: "MeshFilter",
		scene: mainScene,
	  },
	  script: {
		type: "Script",
		script: new CloudBehavior(),
	  },
	},
  };

const island = await loadModel(islandModel,{x:1,y:1,z:1},{x:1,y:92,z:1});

 const islandEntity = {
	c: {
		meshFilter: {
			type: "MeshFilter",
			mesh: island,
			scene: mainScene
		},
	   
	},
   };
const mountain = await loadModel(mountainModel,{x:0.1,y:0.1,z:0.1},{x:1,y:1,z:1});

const mountainEntity = {

	c: {
		meshFilter: {
			type: "MeshFilter",
			mesh: mountain,
			scene: mainScene
		},
		transform: {
			type: "Transform",
			obj: mountain,
		},
		script: {
			type: "Script",
			script: new MountainBehavior(),
		  },
	   
	},
  };
const me = new THREE.Mesh(nonIndexGeo, mat);
nonIndexGeo.scale(10, 10, 10);


const boat = await loadModel(boatModel);
const boatlight=new THREE.SpotLight(0xffffff,0);
var rudder;
var jib;
var mainsail;
boat.traverse((obj) => {
	if (obj.name === 'rudder')
		rudder = obj
	if (obj.name === 'jib')
		jib = obj
	if (obj.name === 'mainsail')
		mainsail = obj
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
const beacons=await loadModel(beaconModel,{x:1,y:1,z:1},{x:1,y:1,z:1});
var beaconIndGeo;
var beaconVoxelMesh;
beacons.traverse(function (child) {
	if (child.isMesh) {
		const geometry = child.geometry;
		const material = child.material;
		console.log(geometry);
		console.log('Number of vertices:', geometry.attributes.position.count);
		beaconIndGeo = geometry;
		beaconVoxelMesh = child
	}
});
const voxy2 = new VoxelizedMesh(beaconVoxelMesh, 0.5, 0.5, {x: 0.0, y:0.0, z:0.0}, new THREE.MeshLambertMaterial({color: 0x00ff00}))
beaconVoxelMesh= voxy2.voxelMesh
// mainScene.add(beaconVoxelMesh);
const beaconNonIndGeo = beaconIndGeo.toNonIndexed()
beacons.position.y=3;
 const beaconEntity={
	c: {
		meshFilter: {
			type: "MeshFilter",
			mesh: beacons,
			scene: mainScene,
		},
		// transform: {
		// 	type: "Transform",
		// 	obj: beacons,
		// },
		rigidBody: {
		  type: "RigidBody",
		  geometry: beaconNonIndGeo,
		  mass: 1000,
		  affectedByGravity: true,
		},
		buoyantBody: {
			type: "BuoyantBody",
			voxelizedMesh: voxy2,
			water: water,
			drawVoxels: true,
			minimumWaterAngularDrag: 0.02,
			minimumWaterDrag: 0.02,
			fluidDensity: 1029,
			volume: 20,
		},
		
	},
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

const voxy = new VoxelizedMesh(phyBoatVoxelMesh, 0.5, 0.6, {x: 0.0, y:0.0, z:0.0}, new THREE.MeshLambertMaterial({color: 0x00ff00}))
phyBoatVoxelMesh= voxy.voxelMesh
//mainScene.add(phyBoatVoxelMesh)
const phyBoatNonIndGeo = phyBoatIndGeo.toNonIndexed()
boat.position.y=3;
const boatEntity = {
	tags: ["objectToBeFollowed"],
	c: {
		meshFilter: {
			type: "MeshFilter",
			mesh: boat,
			scene: mainScene,
			light:boatlight,
		},
		transform: {
			type: "Transform",
			obj: boat,
		},
		rigidBody: {
		  type: "RigidBody",
		  geometry: phyBoatNonIndGeo,
		  mass: 8000,
		  affectedByGravity: true,
		},
		buoyantBody: {
			type: "BuoyantBody",
			voxelizedMesh: voxy,
			water: water,
			drawVoxels: true,
			minimumWaterAngularDrag: 0.02,
			minimumWaterDrag: 0.02,
			fluidDensity: 1029,
			volume: 23,
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
const mixedEntity = {
  c: {
      transform: {
          type: "Transform",
          obj: rudder,
      },
      script: {
          type: "Script",
          script: new Rudder(rudder,45, -45, {x: 0, y:0, z:-3}),
      },
	  script2: {
          type: "Script",
          script: new MainSailControls(mainsail, 80, -80, {x: 0, y:0, z:0}, 'KeyY', 'KeyU'),
    	},
		script3: {
          type: "Script",
          script: new MainSailControls(jib, 80, -80, {x: 0, y:0, z:0}, 'KeyZ', 'KeyX'),
    	},
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
	mixedEntity,
	invisibleMeshEntitiy,
	cloudEntity,
	islandEntity,
	mountainEntity,
	beaconEntity
];

export { entities };
