import Behavior from "./base";
import * as THREE from 'three'
import path from '../../assets/textures/StandardCubeMap.png';
class SkyBehavior extends Behavior {
    start() {
        const sunpos = new THREE.Vector3();
        const phi = THREE.MathUtils.degToRad(90 - 2);
        const theta = THREE.MathUtils.degToRad(180);
        sunpos.setFromSphericalCoords(1, phi, theta);
        this.mesh.scale.setScalar(4500);
        this.settings['turbidity'].value = 0.5;
        this.settings['rayleigh'].value = 1.4;
        this.settings['mieCoefficient'].value = 0.001;
        this.settings['mieDirectionalG'].value = 0.87;
        this.settings['sunPosition'].value = sunpos;

        var directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.5);
        ambientLight.castShadow=true;   
        directionalLight.castShadow = true;
        directionalLight.position.copy(sunpos);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load(path, (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            
          });

        const helper = new THREE.DirectionalLightHelper(directionalLight);
        this.scene.add(helper);
        let renderer = this.createQuery().fromAll('GameRender').execute().values().next().value.getOne('GameRender').renderer
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        const sceneEnv = new THREE.Scene()
        var renderTarget;
        sceneEnv.add(this.mesh);
        renderTarget = pmremGenerator.fromScene(sceneEnv);
        this.scene.add(this.mesh);
        this.scene.environment = renderTarget.texture
    }

    update() {
        this.transform.position.x;
    }

    get settings() {
        return this.mesh.material.uniforms;
    }
}

export default SkyBehavior;