import Behavior from "./base";
import * as THREE from 'three'

class SkyBehavior extends Behavior {
    start() {
        const sunpos = new THREE.Vector3();
        const phi = THREE.MathUtils.degToRad(90 - 2);
        const theta = THREE.MathUtils.degToRad(180);
        sunpos.setFromSphericalCoords(1, phi, theta);
        this.mesh.scale.setScalar(4500);
        this.settings['turbidity'].value = 0.05;
        this.settings['rayleigh'].value = 4;
        this.settings['mieCoefficient'].value = 0.1;
        this.settings['mieDirectionalG'].value = 0.87;
        this.settings['sunPosition'].value = sunpos;
    }

    update() {
        this.transform.position.x;
    }

    get settings() {
        return this.mesh.material.uniforms;
    }
}

export default SkyBehavior;