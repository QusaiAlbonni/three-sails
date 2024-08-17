import { entities } from "../entities";
import Behavior from "./base";
import * as THREE from 'three'


class Rudder extends Behavior {

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
        const testCube = this.mymesh;
        testCube.position.add(new THREE.Vector3(this.offset.x, this.offset.y, this.offset.z))
        let currentRotation = 0;
        let rotatingBack = false;

        const angleStep = Math.PI / 90;
        const maxAngle = this.maxAngle;
        const minAngle = this.minAngle;

        function rotateCube(event) {
            const quaternion = new THREE.Quaternion();
            switch (event.code) {
                case 'KeyA':
                    if (currentRotation > minAngle) {
                        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angleStep);
                        testCube.quaternion.multiplyQuaternions(quaternion, testCube.quaternion);
                        currentRotation -= THREE.MathUtils.radToDeg(angleStep);
                        rotatingBack = false;
                    }
                    break;
                case 'KeyD':
                    if (currentRotation < maxAngle) {
                        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angleStep);
                        testCube.quaternion.multiplyQuaternions(quaternion, testCube.quaternion);
                        currentRotation += THREE.MathUtils.radToDeg(angleStep);
                        rotatingBack = false;
                    }
                    break;
            }
        }

        window.addEventListener('keydown', rotateCube);
        window.addEventListener('keyup', (event) => {
            if (event.code === 'KeyA' || event.code === 'KeyD') {
                rotatingBack = true;
                resetCubeRotation();
            }
        });

        function resetCubeRotation() {
            const angleStep = Math.PI / 180;
            function animateReturn() {
                if (!rotatingBack) return;
                if (currentRotation > 0) {
                    const quaternion = new THREE.Quaternion();
                    quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angleStep);
                    testCube.quaternion.multiplyQuaternions(quaternion, testCube.quaternion);
                    currentRotation -= THREE.MathUtils.radToDeg(angleStep);
                    if (currentRotation <= 0) {
                        currentRotation = 0;
                        rotatingBack = false;
                    }
                } else if (currentRotation < 0) {
                    const quaternion = new THREE.Quaternion();
                    quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angleStep);
                    testCube.quaternion.multiplyQuaternions(quaternion, testCube.quaternion);
                    currentRotation += THREE.MathUtils.radToDeg(angleStep);
                    if (currentRotation >= 0) {
                        currentRotation = 0;
                        rotatingBack = false;
                    }
                } else {
                    rotatingBack = false;
                }
                if (rotatingBack) {
                    requestAnimationFrame(animateReturn);
                }
            }
            requestAnimationFrame(animateReturn);
        }
    }
    update() {
    }
} export default Rudder;