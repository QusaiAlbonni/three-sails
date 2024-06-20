import { Component } from "ape-ecs";
import { Effect, Pass, BloomEffect, EffectPass } from "postprocessing";
import { Camera, Mesh, Object3D} from "three";
import Behavior from "./scripts/base";

class Transform extends Component {
    static properties = {
        obj: new Object3D(),
    }
};

class MeshFilter extends Component{
    static properties = {
        mesh: new Mesh(),
        scene: undefined
    }
    preDestroy(){
        if (this.scene !== undefined)
            this.scene.remove(this.mesh);
    }
};

class GameRender extends Component{
    static properties = {
        renderer: undefined,
        scene: undefined,
        composer: undefined,
        width: window.innerWidth,
        height: window.innerHeight,
        domElement: document.body,
        resize: true,
        resizeContext: window
    }
};

class CameraComponent extends Component{
    static properties = {
        camera: new Camera()
    }
};

class PassComponent extends Component{
    static properties = {
        pass: new Pass(),
        composer: undefined
    }
    preDestroy(){
        if (this.composer !== undefined)
            this.composer.removePass(this.pass);
    }
}


class Script extends Component{
    static properties = {
        script: new Behavior()
    }
    preDestroy(){
        if (this.script !== undefined)
            this.script.destroy();
    }
}

class GUIcomponent extends Component{
    static properties = {
        list: Array(),
    }
}

const components = [
    Transform,
    GameRender,
    MeshFilter,
    CameraComponent,
    PassComponent,
    GUIcomponent,
    Script
];

const tags = [
    'MainCamera',
    'MainGameRender'
]

export {
    components,
    tags,
    Transform,
    MeshFilter,
    GameRender,
    CameraComponent,
    PassComponent,
    GUIcomponent,
    Script
};