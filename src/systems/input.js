import { System } from "ape-ecs";
import { Entity } from "ape-ecs";
import { Clock } from "three";
import * as THREE from "three";
import { Vector2 } from "three";
class ThirdPersonCamera {
    constructor(params) {
        this._params = params;
        this._camera = params.camera;
        this._currentPosition = new THREE.Vector3();
        this._currentLookat = new THREE.Vector3();
    }

    _CalculateIdealOffset() {
        const idealOffset = new THREE.Vector3(0, 10, -15);
        idealOffset.applyQuaternion(this._params.target.quaternion);
        idealOffset.add(this._params.target.position);
        return idealOffset;
    }

    _CalculateIdealLookat() {
        const idealLookat = new THREE.Vector3(-15, 5, 50);
        idealLookat.applyQuaternion(this._params.target.quaternion);
        idealLookat.add(this._params.target.position);
        return idealLookat;
    }

    Update(timeElapsed) {
        const idealOffset = this._CalculateIdealOffset();
        const idealLookat = this._CalculateIdealLookat();
        const t = 1.0 - Math.pow(0.001, timeElapsed);

        this._currentPosition.lerp(idealOffset, t);
        this._currentLookat.lerp(idealLookat, t);

        this._camera.position.copy(this._currentPosition);
        this._camera.lookAt(this._currentLookat);
    }
}
class InputSystem extends System {
    init() {
        this.mainCameraQuery = this.createQuery().fromAll('MainCamera', 'CameraComponent').persist();
        this.cameraQuery = this.mainCameraQuery.execute().values().next().value.getOne('CameraComponent')
        this.camera = this.cameraQuery.camera;
        this.boatQuery = this.createQuery().fromAll('objectToBeFollowed').persist();
        this.boat = this.boatQuery.execute().values().next().value.getOne('MeshFilter').mesh
        this.boatLight = this.boatQuery.execute().values().next().value.getOne("MeshFilter").light;
        this.invisibleQuery = this.createQuery().fromAll('Follower').persist();
        this.invisibleFollower = this.invisibleQuery.execute().values().next().value.getOne('Transform').obj
        this.angle = 0;
        this.radius = -10;
        this.height = 6
        this.mouse = new THREE.Vector2();
        this.prevMouse = {
            x: 0,
            y: 0,
        }
        this.movementMouse = 0;
        this.movement = -0.3;
        this.movementk = 0;
        this.rot = 0;
        this.rotk = 0.05;
        this.freelock = true;
        this.ppress = false;
        this.movmenthor = 0 ;
        this.distance = 0 ;
        this.twopositioncamera = false;

        this.keyboard = [];
        this.targetCameraPosition = new THREE.Vector3();
        this.targetCameraRotation = new THREE.Quaternion();
        this.lerpAlpha = 1;
        this.boatLight.distance = 100;
        this.boatLight.angle = Math.PI / 4; 
        this.boatLight.penumbra = 0.5; 
        this.boatLight.decay = 0;
        const lightOffset = new THREE.Vector3(0, 2, 3.3);
        this.boatLight.position.copy(lightOffset);
        this.boatLight.target.position.set(0,0,+40);
        this.boat.add(this.boatLight);
        this.boat.add(this.boatLight.target);
        window.addEventListener('keydown', (event) => {
            this.keyboard[event.key] = true;
        })
        window.addEventListener('keyup', (event) => {
            this.keyboard[event.key] = false;
        })
        window.addEventListener('keypress', (event) => {
            if (event.key == 'p') {
                if(this.ppress==false){
                    if(this.freelock==true){
                        this.freelock= false ;
                        this.followBoat = !this.followBoat
                    }
                }
                this.ppress = !this.ppress;
            }
            if(event.key=='f'){
                this.freelock=!this.freelock;
                this.twopositioncamera=false;
            }
            if(event.key == 'g'){
                this.twopositioncamera=!this.twopositioncamera
                if(this.twopositioncamera){
                    this.distance=3;
                    this.radius= -5;
                    this.height = 1;
                }else{
                    this.distance = 0;
                    this.radius = -10;
                    this.height = 6;
                }
            }
        })
        this._thirdPersonCamera = new ThirdPersonCamera({
            camera: this.camera,
            target: this.boat,
        });
    }
        update(timeElapsed) {
            if(this.movementMouse == 0){
                this.mousing();
            }
            this._processKeyboard();
            this._pressKeyboard(timeElapsed);
           
            
        }
        _processKeyboard() {
            // if (this.ppress) {
            //     if (this.keyboard['d']) {
            //         this.boat.rotation.y -= 0.01;
            //     } else if (this.keyboard['a']) {
            //         this.boat.rotation.y += 0.01;
            //     }
            // }
    
            if(this.freelock){
                if(this.keyboard['w']){
                    this.movementk = +0.5 ;
                }
               else if(this.keyboard['s']) {
                    this.movementk = -0.5 ;
                }else if (this.keyboard['a']){
                   this.movmenthor = +0.5;
                }
                else if (this.keyboard['d']){
                    this.movmenthor = -0.5;
                 }
                else {
                    this.movementk=0;
                    this.movmenthor = 0;
                }
               }
        }
        mousing() {
            window.addEventListener('mousemove', (event) => {
                this.movementMouse = 1 ;
                this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(event.clientY / window.innerHeight) * 2 - 1;
                if(this.freelock){
                    this.freelock = true;
                }
                this.prevMouse.x = this.mouse.x;
                this.prevMouse.y = this.mouse.y;
            });
            
        }
        _pressKeyboard(timeElapsed) {
            if (this.ppress) {
                const directionp = new THREE.Vector3(0, 0, 1);
                directionp.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.boat.rotation.y);
                this.updateInvisibleFollowerPosition();
                this.invisibleFollower.position.copy(this.boat.position);
                this.invisibleFollower.rotation.copy(this.boat.rotation);
                const t = 1.0 - Math.pow(0.001, timeElapsed);
                this.camera.position.y = this.invisibleFollower.position.y + this.height;
                const distancep = this.radius; 
                const sphereXp = this.invisibleFollower.position.x + distancep * Math.sin(this.invisibleFollower.rotation.y);
                const sphereZp = this.invisibleFollower.position.z + distancep * Math.cos(this.invisibleFollower.rotation.y);
                this.targetCameraPosition.set(sphereXp, this.camera.position.y, sphereZp);
    
                // Linear interpolation
                this.camera.position.lerp(this.targetCameraPosition, t);
                this.targetCameraRotation.copy(this.invisibleFollower.quaternion);
                this.camera.quaternion.slerp(this.targetCameraRotation, t);
                this.camera.lookAt(this.invisibleFollower.position);
            }
            if (this.freelock) {
             if(this.freelock){
                this.invisibleFollower.rotation.y =- this.mouse.x * Math.PI;  
                this.invisibleFollower.rotation.x = - this.mouse.y *0.5* Math.PI; 
         
                this.invisibleFollower.position.x += Math.sin(this.invisibleFollower.rotation.y) * this.movementk;
                this.invisibleFollower.position.z += Math.cos(this.invisibleFollower.rotation.y) * this.movementk;
                this.invisibleFollower.position.y += Math.sin(this.invisibleFollower.rotation.x) * this.movementk;

                this.invisibleFollower.position.x += Math.cos(this.invisibleFollower.rotation.y) * this.movmenthor;
                this.invisibleFollower.position.z -= Math.sin(this.invisibleFollower.rotation.y) * this.movmenthor;
    
                const distancep = -8;
                const sphereXp = this.invisibleFollower.position.x + distancep * Math.sin(this.invisibleFollower.rotation.y);
                const sphereZp = this.invisibleFollower.position.z + distancep * Math.cos(this.invisibleFollower.rotation.y);
                const sphereYp = this.invisibleFollower.position.y + distancep * Math.sin(this.invisibleFollower.rotation.x);       
                this.camera.position.set(sphereXp, sphereYp + 10, sphereZp);
                this.camera.lookAt(this.invisibleFollower.position);
             }
            }
       }

       updateInvisibleFollowerPosition() {
        const boatDirection = new THREE.Vector3();
        this.boat.getWorldDirection(boatDirection);
        const newPosition = this.boat.position.clone().add(boatDirection.multiplyScalar(this.distance));
        this.invisibleFollower.position.copy(newPosition);
    }
    
    }

export default InputSystem;