import { Component } from "ape-ecs";
import { Effect, Pass, BloomEffect, EffectPass } from "postprocessing";
import { Camera, Matrix3, Mesh, Object3D, Vector3} from "three";
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




class RigidBody extends Component{
    static properties = {
        position: undefined,
        rotation: undefined,
        centreOfMass: new Vector3(),
        inertiaTensor: new Matrix3(),
        velocity: new Vector3(),
        angularVelocity: new Vector3(),
        mass: 0,
        isKinematic: true,
        totalForce: new Vector3(),
        totalTorque: new Vector3(),

        applyForce(force){
            this.totalForce.add(force);
        },

        applyForceAtPosition(force, position){
            this.totalForce.add(force);
            this.totalTorque.add(new Vector3().crossVectors(position - this.position, force));
        },

    }
};



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
    Script,
    RigidBody
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