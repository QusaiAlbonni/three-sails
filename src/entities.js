import * as THREE from 'three';
import { EffectComposer, BloomEffect, EffectPass, FXAAEffect, SSAOEffect } from "postprocessing";
import { Sky } from 'three/addons/objects/Sky.js';
import Water from './water';
import { WaterBehavior, CameraBehavior, NewScript, SkyBehavior, BoxBehavior } from './scripts/behaviors';

const renderer = new THREE.WebGLRenderer({ powerPreference: "high-performance" });
const mainScene = new THREE.Scene();
const composer = new EffectComposer(renderer);
const mainCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const gameRenderEntity = {
    tags: ['MainGameRender'],
    c: {
        gameRender: {
            type: 'GameRender',
            renderer: renderer,
            scene: mainScene,
            composer: composer
        }
    }
};


const geo = new THREE.BoxGeometry();
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
        }
    }
};

const cameraEntity = {
    tags: ['MainCamera'],
    c: {
        camera: {
            type: 'CameraComponent',
            camera: mainCamera
        },
        transform: {
            type: 'Transform',
            obj: mainCamera
        },
        script: {
            type: 'Script',
            script: new CameraBehavior()
        }
    }
};

const bloomEffect = new BloomEffect({ intensity: 0.0 });
const bloomPass = new EffectPass(mainCamera, bloomEffect);
const fxaaPass = new EffectPass(mainCamera, new FXAAEffect());

const postProcessingEntity = {
    c: {
        bloom: {
            type: 'PassComponent',
            pass: bloomPass,
            composer: composer
        },
        fxaa: {
            type: 'PassComponent',
            pass: fxaaPass,
            composer: composer
        },
        ssao: {
            type: 'PassComponent',
            pass: new EffectPass(mainCamera, new SSAOEffect(mainCamera, mainScene))
        }
    }
};

const sky = new Sky();

const skyEntity = {
    c: {
        meshFilter: {
            type: 'MeshFilter',
            mesh: sky,
            scene: mainScene
        },
        transform: {
            type: 'Transform',
            obj: sky
        },
        script: {
            type: 'Script',
            script: new SkyBehavior()
        }
    }
};

const me = new THREE.Mesh();
const exampleBoxEntity = {
    c: {
        meshFilter: {
            type: 'MeshFilter',
            mesh: me,
            scene: mainScene,
        },
        script: {
            type: 'Script',
            script: new NewScript()
        },
        transform: {
            type: 'Transform',
            obj: me
        }

    }
};

const water = new Water(65, 4000000, 14000000);
const waterEntity = {
    c: {
        meshFilter: {
            type: 'MeshFilter',
            mesh: water,
            scene: mainScene,
        },
        transform: {
            type: 'Transform',
            obj: water
        },
        script: {
            type: 'Script',
            script: new WaterBehavior()
        }
    }
};

const entities = [
    gameRenderEntity,
    boxEntity,
    cameraEntity,
    postProcessingEntity,
    skyEntity,
    exampleBoxEntity,
    waterEntity
];

export {
    entities
};