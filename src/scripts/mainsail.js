import { entities } from "../entities";
import Behavior from "./base";
import * as THREE from 'three'


class MainSailControls extends Behavior {

    constructor(mesh, maxAngle = 60, minAngle = -60, offset = { x: 0, y: 0, z: 0 }, rightKey = 'KeyD', leftKey = 'KeyA') {
        super()
        this.mymesh = mesh
        this.maxAngle = maxAngle
        this.minAngle = minAngle
        this.offset = offset
        this.rightKey = rightKey
        this.leftKey = leftKey
    }
    start() {
        const testCube2 = this.mymesh;
        testCube2.position.add(new THREE.Vector3(this.offset.x, this.offset.y, this.offset.z))
        this.currentRotation = 0;
        this.angleStep2 = Math.PI / 90;
        this.maxAngle2 = this.maxAngle;
        this.minAngle2 = this.minAngle;

        window.addEventListener('keydown', this.rotateCube.bind(this));

       
    }

    rotateCube(event) {
        const quaternion2 = new THREE.Quaternion();
        switch (event.code) {
            case this.leftKey:
                if (this.currentRotation > this.minAngle2) {
                    quaternion2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.angleStep2);
                    this.mymesh.quaternion.multiplyQuaternions(quaternion2, this.mymesh.quaternion);
                    this.currentRotation -= THREE.MathUtils.radToDeg(this.angleStep2);
                }
                break;
            case this.rightKey:
                if (this.currentRotation < this.maxAngle2) {
                    quaternion2.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.angleStep2);
                    this.mymesh.quaternion.multiplyQuaternions(quaternion2, this.mymesh.quaternion);
                    this.currentRotation += THREE.MathUtils.radToDeg(this.angleStep2);
                }
                break;
        }
    }
    update() {
    }
} export default MainSailControls;