import Behavior from "./base";
import * as THREE from "three";

class SkyBehavior extends Behavior {
    start() {
        this.boatQuery = this.createQuery().fromAll('objectToBeFollowed').persist();
        this.boatLight=this.boatQuery.execute().values().next().value.getOne('MeshFilter').light
        this.isDay = true;
        this.headlight=false;
        this.nightLightIntensity=1;
        this.transition = 0; 
        this.transitionSpeed = 0.02; 
        this.sunPos = new THREE.Vector3();
        this.moonPos = new THREE.Vector3();

        const sunPhi = THREE.MathUtils.degToRad(90 - 30); 
        const sunTheta = THREE.MathUtils.degToRad(90); 
        this.sunPos.setFromSphericalCoords(1, sunPhi, sunTheta);

        const moonPhi = THREE.MathUtils.degToRad(90 - 8);
        const moonTheta = THREE.MathUtils.degToRad(150);
        this.moonPos.setFromSphericalCoords(1, moonPhi, moonTheta);

        this.daySettings = {
            turbidity: 0.5,
            rayleigh: 0.5,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.87,
            lightColor: 0x9999ff,
            lightIntensity: 1.5,
            ambientColor: 0xffffff,
            ambientIntensity: 0.5,
            position: this.sunPos
        };

        this.nightSettings = {
            turbidity: 10,
            rayleigh: 0.5,
            mieCoefficient: 0.1,
            mieDirectionalG: 1,
            lightColor: 0x9999ff,
            lightIntensity: 0.5,
            ambientColor: 0xffffff,
            ambientIntensity: 0.1,
            position: this.moonPos
        };

        this.currentSettings = { ...this.daySettings };

        this.directionalLight = new THREE.DirectionalLight(this.currentSettings.lightColor, this.currentSettings.lightIntensity);
        this.ambientLight = new THREE.AmbientLight(this.currentSettings.ambientColor, this.currentSettings.ambientIntensity);
        this.ambientLight.castShadow = true;
        this.directionalLight.castShadow = true;
        this.directionalLight.position.copy(this.currentSettings.position);

        this.scene.add(this.ambientLight);
        this.scene.add(this.directionalLight);

        const helper = new THREE.DirectionalLightHelper(this.directionalLight);
        this.scene.add(helper);

        this.mesh.scale.setScalar(4500);
        this.updateSkySettings();

        let renderer = this.createQuery().fromAll('GameRender').execute().values().next().value.getOne('GameRender').renderer;
        this.pmremGenerator = new THREE.PMREMGenerator(renderer);
        this.sceneEnv = new THREE.Scene();
        this.sceneEnv.add(this.mesh);
        this.renderTarget = this.pmremGenerator.fromScene(this.sceneEnv);
        this.scene.add(this.mesh);
        this.scene.environment = this.renderTarget.texture;

        window.addEventListener('keydown', (event) => {
            if (event.key === 'n') {
                this.isDay = !this.isDay;
            }
            if(event.key ==='l'){
                this.headlight = !this.headlight;
                this.updateBoatLight();
            }
        });
    }

    update() {
        const targetTransition = this.isDay ? 0 : 1;
    
        if (this.transition !== targetTransition) {
            if (this.transition < targetTransition) {
                this.transition = Math.min(this.transition + this.transitionSpeed, targetTransition);
            } else {
                this.transition = Math.max(this.transition - this.transitionSpeed, targetTransition);
            }
            this.updateSkySettings();
            this.sceneEnv.add(this.mesh);
            this.renderTarget = this.pmremGenerator.fromScene(this.sceneEnv);
            this.scene.add(this.mesh);
            this.scene.environment = this.renderTarget.texture;
            this.updateBoatLight();
        }
    }

    updateSkySettings() {
        const t = this.transition;
        const day = this.daySettings;
        const night = this.nightSettings;

        this.settings['turbidity'].value = day.turbidity + (night.turbidity - day.turbidity) * t;
        this.settings['rayleigh'].value = day.rayleigh + (night.rayleigh - day.rayleigh) * t;
        this.settings['mieCoefficient'].value = day.mieCoefficient + (night.mieCoefficient - day.mieCoefficient) * t;
        this.settings['mieDirectionalG'].value = day.mieDirectionalG + (night.mieDirectionalG - day.mieDirectionalG) * t;
        this.settings['sunPosition'].value.lerpVectors(day.position, night.position, t);const lightColor = new THREE.Color(day.lightColor).lerp(new THREE.Color(night.lightColor), t);
        this.directionalLight.color.set(lightColor);
        this.directionalLight.intensity = day.lightIntensity + (night.lightIntensity - day.lightIntensity) * t;
        const ambientColor = new THREE.Color(day.ambientColor).lerp(new THREE.Color(night.ambientColor), t);
        this.ambientLight.color.set(ambientColor);
        this.ambientLight.intensity = day.ambientIntensity + (night.ambientIntensity - day.ambientIntensity) * t;

        this.directionalLight.position.lerpVectors(day.position, night.position, t);
        
    }
    updateBoatLight() {
        const t = this.transition;
        const dayLightIntensity = 0; // Light off during the day
        if(this.headlight){ 
        this.nightLightIntensity=300;
        this.boatLight.distance=200;
        }
        else{
        this.nightLightIntensity=150;
        this.boatLight.distance=100;
        }
        this.boatLight.intensity = dayLightIntensity + (this.nightLightIntensity - dayLightIntensity) * t;
        
    }

    get settings() {
        return this.mesh.material.uniforms;
    }
}

export default SkyBehavior;