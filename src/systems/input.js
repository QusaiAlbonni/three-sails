import { System } from "ape-ecs";
import { Entity } from "ape-ecs";
import { Clock } from "three";
import * as THREE from "three";
import { Vector2 } from "three";
class InputSystem extends System {
    init() {
        this.mainCameraQuery = this.createQuery().fromAll('MainCamera', 'CameraComponent').persist();
        this.cameraQuery = this.mainCameraQuery.execute().values().next().value.getOne('CameraComponent')
        this.camera = this.cameraQuery.camera;
        this.boatQuery = this.createQuery().fromAll('objectToBeFollowed').persist();
        this.boat = this.boatQuery.execute().values().next().value.getOne('MeshFilter').mesh
        this.invisibleQuery = this.createQuery().fromAll('Follower').persist();
        this.invisibleFollower = this.invisibleQuery.execute().values().next().value.getOne('Transform').obj
        this.angle = 0;
        this.radius = 30;
        this.height = 15
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
        this.ppress = true;

        this.keyboard = [];
        window.addEventListener('keydown', (event) => {
            this.keyboard[event.key] = true;
        })
        window.addEventListener('keyup', (event) => {
            this.keyboard[event.key] = false;
        })
        window.addEventListener('keypress', (event) => {
            if (event.key == 'p') {
                this.ppress = !this.ppress;
            }
            if (event.key == 'f') {
                this.freelock = !this.freelock;
            }
        })

    }
    update() {
        if (this.movementMouse == 0) {
            this.mousing();
        }
        this._processKeyboard();
        this._pressKeyboard();
    }
    _processKeyboard() {
        if (this.ppress) {
            if (this.keyboard['d']) {
                this.rot = -0.01;
            }
            else if (this.keyboard['a']) {
                this.rot = 0.01;
            }
            else {
                this.rot = 0;
            }
        } if (this.freelock) {
            if (this.keyboard['w']) {
                this.movementk = -1;
            }
            else if (this.keyboard['s']) {
                this.movementk = 1;
            }
            else {
                this.movementk = 0;
            }
        }
    }
    mousing() {
        window.addEventListener('mousemove', (event) => {
            this.movementMouse = 1;
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
            if (this.freelock) {
                this.freelock = true;
            }
            this.prevMouse.x = this.mouse.x;
            this.prevMouse.y = this.mouse.y;
        });

    }
    _pressKeyboard() {
        if (this.ppress) {
            const directionp = new THREE.Vector3(0, 0, 1); directionp.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.boat.rotation.y);
            this.invisibleFollower.position.copy(this.boat.position);
            this.invisibleFollower.rotation.copy(this.boat.rotation);
            this.camera.position.y = this.invisibleFollower.position.y + 5;
            const distancep = 3;
            const sphereXp = this.invisibleFollower.position.x + distancep * Math.sin(this.invisibleFollower.rotation.y);
            const sphereZp = this.invisibleFollower.position.z + distancep * Math.cos(this.invisibleFollower.rotation.y);
            this.camera.position.set(sphereXp, this.camera.position.y, sphereZp);
            this.camera.lookAt(this.invisibleFollower.position);
        }
        if (this.freelock) {
            if (this.freelock) {
                this.invisibleFollower.rotation.y = - this.mouse.x * Math.PI;
                this.invisibleFollower.rotation.x = this.mouse.y * 0.5 * Math.PI;

                this.invisibleFollower.position.x += Math.sin(this.invisibleFollower.rotation.y) * this.movementk;
                this.invisibleFollower.position.z += Math.cos(this.invisibleFollower.rotation.y) * this.movementk;
                this.invisibleFollower.position.y += Math.sin(this.invisibleFollower.rotation.x) * this.movementk;
                const distancep = 8;
                const sphereXp = this.invisibleFollower.position.x + distancep * Math.sin(this.invisibleFollower.rotation.y);
                const sphereZp = this.invisibleFollower.position.z + distancep * Math.cos(this.invisibleFollower.rotation.y);
                const sphereYp = this.invisibleFollower.position.y + distancep * Math.sin(this.invisibleFollower.rotation.x);

                this.camera.position.set(sphereXp, sphereYp + 10, sphereZp);
                this.camera.lookAt(this.invisibleFollower.position);
            }
        }
    }
}

export default InputSystem;