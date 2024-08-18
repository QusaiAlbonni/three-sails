import Behavior from "./base";
import * as THREE from "three";
import cloudmodel from "../../assets/models/cloud/clouds.glb";
import { loadModel } from "../utils";

class CloudBehavior extends Behavior {
    
    cloudpartical = [];
    flash;
    flashIntensity = 0; 
    glowTimers = [];
    rain;
    raingeo;
    raincount = 15000;
    rainDrops = [];
    winterEffectEnabled = false;  

    async start() {
        
        this.flash = new THREE.PointLight(0x062d89, 0, 500, 0);  
        this.flash.position.set(200, 300, 100);

        
        this.raingeo = new THREE.BufferGeometry();
        const rainPositions = new Float32Array(this.raincount * 3);
        for (let i = 0; i < this.raincount; i++) {
            const rainDrop = {
                position: new THREE.Vector3(
                    getRandomBetween(500, -500),
                    Math.random() * 200,
                    getRandomBetween(500, -500)
                ),
                velocity: {
                    x: 0,
                    y: -1.5 + Math.random() * 0.1,
                    z: 0
                }
            };
            this.rainDrops.push(rainDrop);
            rainPositions[i * 3] = rainDrop.position.x;
            rainPositions[i * 3 + 1] = rainDrop.position.y;
            rainPositions[i * 3 + 2] = rainDrop.position.z;
        }

        this.raingeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

        const rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true
        });

        this.rain = new THREE.Points(this.raingeo, rainMaterial);
        this.fog = new THREE.FogExp2(0x1c1c2a, 0.002);

        const originalCloud = await loadModel(cloudmodel, { x: 0.1,y: 0.1,z: 0.1,});

        for (let p = 0; p < 250; p++) {
            const cloud = originalCloud.clone();  
            cloud.position.set(
                getRandomBetween(1000, -1000),
                250,
                getRandomBetween(1000, -1000)
            );

            cloud.traverse(function (node) {
                if (node.isMesh) {
                    node.material = new THREE.MeshStandardMaterial({
                        color: 0x9E9E9E,
                        metalness: 0.5,
                        roughness: 0.5,
                        emissive: 0x4B86A0,
                        emissiveIntensity: 0
                    });
                }
            });

            this.cloudpartical.push(cloud);
        }

        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    onKeyDown(event) {
        if (event.key == 'n') {
            this.toggleWinterEffect();
        }
    }

    toggleWinterEffect() {
        this.winterEffectEnabled = !this.winterEffectEnabled;

        if (this.winterEffectEnabled) {
            this.scene.add(this.flash);
            this.scene.add(this.rain);
            this.scene.fog = this.fog;
            for (let cloud of this.cloudpartical) {
                this.scene.add(cloud);
            }
        } else {
            this.scene.remove(this.flash);
            this.scene.remove(this.rain);
            this.scene.fog = null;
            for (let cloud of this.cloudpartical) {
                this.scene.remove(cloud);
            }
        }
    }update() {
        if (this.winterEffectEnabled) {
            for (let p of this.cloudpartical) {
                p.rotation.y -= 0.0005;
            }
    
            if (Math.random() > 0.9 || this.flash.power > 100) {
                if (this.flash.power < 100) {
                    this.flash.position.set(
                        getRandomBetween(500, -500),
                        0 + Math.random() * 200,
                        getRandomBetween(500, -500),
                    );
                    this.flash.power = 50 + Math.random() * 500;
                    this.flashIntensity = this.flash.power;
                } else {
                    this.flash.power = 0;
                    this.flashIntensity = 0;
                }
            }
    
            const positions = this.raingeo.attributes.position.array;
            for (let i = 0; i < this.raincount; i++) {
                const rainDrop = this.rainDrops[i];
                rainDrop.position.y += rainDrop.velocity.y;
    
                if (rainDrop.position.y < 0) {
                    rainDrop.position.y = 200;
                }
    
                positions[i * 3] = rainDrop.position.x;
                positions[i * 3 + 1] = rainDrop.position.y;
                positions[i * 3 + 2] = rainDrop.position.z;
            }
            this.raingeo.attributes.position.needsUpdate = true;
            this.rain.rotation.y += 0.002;
        }
    }
}

function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

export default CloudBehavior;