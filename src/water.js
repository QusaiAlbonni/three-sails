import { BatchedMesh } from "three";
import * as THREE from 'three'
import waternormals from '../assets/textures/waternormals.jpg'
import water_defines_vertex from '../assets/shaders/water_defines.vert'
import water_begin_vertex from '../assets/shaders/water_begin.vert'

class Water extends BatchedMesh {
    constructor(maxGeometryCount, maxVertexCount, maxIndexCount = maxVertexCount * 2, material = undefined) {
        super(maxGeometryCount, maxVertexCount, maxIndexCount, material);
        this.settings = {
            planeVerts: 600,
            planeSize: 250,
            timeDilation: 1,
            timeOffset: 3,
            numOfWaves: 20,
            startingWaveLength: 26,
            startingAmplitude: 0.12,
            startingSpeed: 0.002,
            directionRandomSeed: 187,
            dirSeedIterator: 1653.215,
            randomnessDirContribution: 0.5,
            //1 or 2 only
            WAVE_FUNCTION: 2,
            ampfactor: 0.82,
            wavefactor: 0.84,
            speedfactor: 0.97,
            k: 2.5,
            numOfIterations: 64,
            maxAmplitude: 3.0,
            waveOffset: 1.0,
            waterHeightFactor: 0.98,
            waterTipColor: new THREE.Vector3(0.2, 0.2, 0.2),
            directionBias: new THREE.Vector2(0.0, 0.0),
            tipColorAttenuation: 5,
            fogDensity: 0.003,
            toneMappingMode: THREE.NoToneMapping,
            shininess: 128,
            //true or false
            PEAK_STYLIZE: true,
            FRESNEL_STYLIZE: false,
            gravityConstant: 9.807,
            minDistanceToWave: 0.01,
            maxDistanceToWave: 1000,
            maxHeightMultiplier: 4,
            objectToBeFollowed: new THREE.Object3D(),
            chunkNum: 8,
            maxHeight: 0,
            amplitudes: [],
            waveLengths: [],
            speeds: [],
            directions: [],
            chunkDropOffFactor: 2,
        }
        this.uniforms = {};
        this.textureLoader = new THREE.TextureLoader();
        this.calculateWaves();
        if (material === undefined)
            this.material = this.setUpMaterial();

        this.chunkQualityFactors = this.generateChunkFactors(this.settings.chunkNum);
        this._addBatches();

    }

    calculateWaves() {
        let amplitude = this.settings.startingAmplitude;
        let wavelength = this.settings.startingWaveLength;
        let speed = this.settings.startingSpeed;

        let dirSeed = this.settings.directionRandomSeed;
        this.settings.speeds.length = 0
        this.settings.amplitudes.length = 0
        this.settings.waveLengths.length = 0
        this.settings.directions.length = 0

        this.settings.speeds.push(0.00001);
        this.settings.amplitudes.push(0.0001);
        this.settings.waveLengths.push(0.0001);
        this.settings.directions.push(new THREE.Vector2(0.0001, 0.0001));
        for (let index = 0; index < this.settings.numOfWaves; index++) {
            if (index < this.settings.numOfIterations) {
                amplitude = this.settings.ampfactor * amplitude;
                wavelength = this.settings.wavefactor * wavelength;
                speed = Math.sqrt((this.settings.gravityConstant * wavelength) / (2 * Math.PI)) * this.settings.speedfactor;
            }
            this.settings.speeds.push(speed);
            this.settings.amplitudes.push(amplitude);
            this.settings.waveLengths.push(wavelength);
            this.settings.directions.push(
                new THREE.Vector2(
                    Math.sin(dirSeed + Math.random() * this.settings.randomnessDirContribution),
                    Math.cos(dirSeed + Math.random() * this.settings.randomnessDirContribution)
                ).add(this.settings.directionBias).normalize()
            );
            dirSeed += this.settings.dirSeedIterator;

        }
        this.settings.planeVerts = Math.ceil(this.settings.planeSize / (this.settings.waveLengths[this.settings.waveLengths.length - 1]));
        this.updateMaxHeight();
    }
    updateMaxHeight() {
        this.settings.maxHeight = this.settings.amplitudes[1] *
            Math.exp(this.settings.maxAmplitude * this.settings.waterHeightFactor - this.settings.waveOffset) * this.settings.maxHeightMultiplier;
    }

    setUpMaterial() {
        this.uniforms = {
            time: { value: 0.01 },
            numWaves: { value: this.settings.amplitudes.length + 1 },
            amplitude: { value: this.settings.amplitudes },
            wavelength: { value: this.settings.waveLengths },
            speed: { value: this.settings.speeds },
            direction: { value: this.settings.directions },
            k: { value: this.settings.k },
            maxAmplitude: { value: this.settings.maxAmplitude },
            waveOffset: { value: this.settings.waveOffset },
            waterHeight: { value: this.settings.maxHeight },
            waterTipColor: { value: this.settings.waterTipColor },
            tipColorAttenuation: { value: this.settings.tipColorAttenuation },
            minDistance: { value: this.settings.minDistanceToWave },
            maxDistance: { value: this.settings.maxDistanceToWave },

        };

        this.standardWaterMat = new THREE.MeshPhysicalMaterial({
            color: 0x112234,
            roughness: 0.09,
            metalness: 0.0,
            reflectivity: 0.4,
            ior: 1.333,
            thickness: 0,
            envMapIntensity: 1.0,
            specularIntensity: 0.1,
            specularColor: 0xff0000,
            transmission: 0,
            bumpMap: this.textureLoader.load(waternormals),
            bumpScale: 0.6,
            defines: {
                NUM_OF_WAVES: this.settings.numOfWaves,
                WAVE_FUNCTION: this.settings.WAVE_FUNCTION,
                e: 2.718,
                pi: 3.14159265,
                FRESNEL_STYLIZE: this.settings.FRESNEL_STYLIZE,
                PEAK_STYLIZE: this.settings.PEAK_STYLIZE,
                STANDARD: "",
                PHYSICAL: ""
            },

        });

        this.standardWaterMat.onBeforeCompile = (shader) => {
            shader.vertexShader = water_defines_vertex + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', water_begin_vertex);
            let prepend = "";
            Object.entries(this.uniforms).forEach(([key, info]) => {
                shader.uniforms[key] = { value: info.value };
            });
            shader.fragmentShader = prepend + shader.fragmentShader;
            this.shader = shader;

        };
        this.standardWaterMat.bumpMap.wrapS = THREE.RepeatWrapping;
        this.standardWaterMat.bumpMap.wrapT = THREE.RepeatWrapping;
        this.standardWaterMat.receiveShadow = true;


        return this.standardWaterMat;
    }
    //this assumes all arrays have the same length
    setNumOfWavesFromWaveArrays() {
        this.settings.numOfWaves = this.settings.amplitudes.length;
        this.uniforms.numWaves = this.settings.numOfWaves + 1;
        return this.settings.numOfWaves;
    }

    generateChunkFactors(size) {
        let matrix = Array.from({ length: size }, () => Array(size).fill(0));

        let numRings = Math.floor(size / this.settings.chunkDropOffFactor);
        if (size % this.settings.chunkDropOffFactor == 0) {
            numRings--;
        }
        for (let ring = 0; ring <= numRings; ring++) {
            let value = Math.pow(this.settings.chunkDropOffFactor, numRings - ring);

            for (let i = ring; i < size - ring; i++) {
                matrix[ring][i] = value;
                matrix[size - ring - 1][i] = value;
                matrix[i][ring] = value;
                matrix[i][size - ring - 1] = value;
            }
        }

        return matrix;
    }

    _addBatches() {
        const starting = this.settings.planeSize * (this.settings.chunkNum / 2) - this.settings.planeSize / 2
        var x = -starting;
        var y = starting;
        for (let index = 0; index < this.settings.chunkNum; index++) {
            for (let index2 = 0; index2 < this.settings.chunkNum; index2++) {
                var geo;
                let vertsNum = Math.ceil(this.settings.planeVerts / this.chunkQualityFactors[index][index2]);
                geo = new THREE.PlaneGeometry(this.settings.planeSize, this.settings.planeSize, vertsNum, vertsNum);
                geo.rotateX(THREE.MathUtils.degToRad(-90));
                geo.translate(x, 0, y);
                this.addGeometry(geo);
                x += this.settings.planeSize;
            }
            x = -starting;
            y -= this.settings.planeSize;
        }
    }

    update(time) {
        this.position.x = this.settings.objectToBeFollowed.position.x;
        this.position.y = this.settings.objectToBeFollowed.position.y;
        this.shader.uniforms.time.value = time * this.settings.timeDilation + this.settings.timeOffset;
        this.material.bumpMap.offset.set(time * 0.01, time * 0.01).add(this.settings.directionBias);
        this._updateShader();
    }

    _updateShader() {
        const uniforms = this.shader.uniforms;
        const updatedUniforms = {
            time: { value: uniforms.time.value },
            numWaves: { value: this.settings.amplitudes.length + 1 },
            amplitude: { value: this.settings.amplitudes },
            wavelength: { value: this.settings.waveLengths },
            speed: { value: this.settings.speeds },
            direction: { value: this.settings.directions },
            k: { value: this.settings.k },
            maxAmplitude: { value: this.settings.maxAmplitude },
            waveOffset: { value: this.settings.waveOffset },
            waterHeight: { value: this.settings.maxHeight },
            waterTipColor: { value: this.settings.waterTipColor },
            tipColorAttenuation: { value: this.settings.tipColorAttenuation },
            minDistance: { value: this.settings.minDistanceToWave },
            maxDistance: { value: this.settings.maxDistanceToWave },

        };
        Object.entries(updatedUniforms).forEach(([key, info]) => {
            uniforms[key] = { value: info.value };
        });

        this.shader.defines = {
            NUM_OF_WAVES: this.settings.numOfWaves,
            WAVE_FUNCTION: this.settings.WAVE_FUNCTION,
            e: 2.718,
            pi: 3.14159265,
            FRESNEL_STYLIZE: this.settings.FRESNEL_STYLIZE,
            PEAK_STYLIZE: this.settings.PEAK_STYLIZE,
            STANDARD: "",
            PHYSICAL: ""
        }

    }
    //call this only once every once and awhile
    setDirectionBias(direction) {
        this.settings.directionBias.copy(direction);
        this.calculateWaves();
        this.setNumOfWavesFromWaveArrays();
    }

    /**
     * @param {THREE.Object3D} obj
     */
    set objectToBeFollowed(obj) {
        this.settings.objectToBeFollowed = obj
    }
    /**
     * @param {THREE.Vector2} position
     * position to be caclulated
     */
    getHeightAtPos(position) {
        return this._waveHeight(position.x, position.y, this.shader.uniforms.numWaves.value, 2);
    }
    /**
     * @param {THREE.Vector2} position
     * position to be caclulated
     */
    getNormalAtPos(position) {
        return this._waveNormal(position.x, position.y, this.shader.uniforms.numWaves.value, 2);        
    }


    _dWavedxExp(i, x, y) {
        const frequency = 2.0 / this.shader.uniforms.wavelength.value[i];
        const phase = this.shader.uniforms.speed.value[i] * frequency;
        const theta = this.shader.uniforms.direction.value[i].dot(new THREE.Vector2(x, y));
        const A = this.shader.uniforms.maxAmplitude.value * this.shader.uniforms.amplitude.value[i] * this.shader.uniforms.direction.value[i].x * frequency;
        return A * Math.cos(theta * frequency + this.shader.uniforms.time.value * phase) * Math.pow(Math.E, Math.sin(theta * frequency + this.shader.uniforms.time.value * phase) - this.shader.uniforms.waveOffset.value);
    }

    _dWavedyExp(i, x, y) {
        const frequency = 2.0 / this.shader.uniforms.wavelength.value[i];
        const phase = this.shader.uniforms.speed.value[i] * frequency;
        const theta = this.shader.uniforms.direction.value[i].dot(new THREE.Vector2(x, y));
        const A = this.shader.uniforms.maxAmplitude.value * this.shader.uniforms.amplitude.value[i] * this.shader.uniforms.direction.value[i].y * frequency;
        return A * Math.cos(theta * frequency + this.shader.uniforms.time.value * phase) * Math.pow(Math.E, Math.sin(theta * frequency + this.shader.uniforms.time.value * phase) - this.shader.uniforms.waveOffset.value);
    }

    _dWavedxPoly(i, x, y) {
        const frequency = 2.0 / this.shader.uniforms.wavelength.value[i];
        const phase = this.shader.uniforms.speed.value[i] * frequency;
        const theta = this.shader.uniforms.direction.value[i].dot(new THREE.Vector2(x, y));
        const A = 2.0 * this.shader.uniforms.k.value * this.shader.uniforms.amplitude.value[i] * this.shader.uniforms.direction.value[i].x * frequency;
        return A * Math.cos(theta * frequency + this.shader.uniforms.time.value * phase) * Math.pow((Math.sin(theta * frequency + this.shader.uniforms.time.value * phase) + 1.0) / 2.0, this.shader.uniforms.k.value - 1.0);
    }

    _dWavedyPoly(i, x, y) {
        const frequency = 2.0 / this.shader.uniforms.wavelength.value[i];
        const phase = this.shader.uniforms.speed.value[i] * frequency;
        const theta = this.shader.uniforms.direction.value[i].dot(new THREE.Vector2(x, y));
        const A = 2.0 * this.shader.uniforms.k.value * this.shader.uniforms.amplitude.value[i] * this.shader.uniforms.direction.value[i].y * frequency;
        return A * Math.cos(theta * frequency + this.shader.uniforms.time.value * phase) * Math.pow((Math.sin(theta * frequency + this.shader.uniforms.time.value * phase) + 1.0) / 2.0, this.shader.uniforms.k.value - 1.0);
    }

    _dWavedx(i, x, y) {
        const frequency = 2.0 * Math.PI / this.shader.uniforms.wavelength.value[i];
        const phase = this.shader.uniforms.speed.value[i] * frequency;
        const theta = this.shader.uniforms.direction.value[i].dot(new THREE.Vector2(x, y));
        const A = this.shader.uniforms.amplitude.value[i] * this.shader.uniforms.direction.value[i].x * frequency;
        return A * Math.cos(theta * frequency + this.shader.uniforms.time.value * phase);
    }

    _dWavedy(i, x, y) {
        const frequency = 2.0 * Math.PI / this.shader.uniforms.wavelength.value[i];
        const phase = this.shader.uniforms.speed.value[i] * frequency;
        const theta = this.shader.uniforms.direction.value[i].dot(new THREE.Vector2(x, y));
        const A = this.shader.uniforms.amplitude.value[i] * this.shader.uniforms.direction.value[i].y * frequency;
        return A * Math.cos(theta * frequency + this.shader.uniforms.time.value * phase);
    }

    _wavePoly(i, x, y) {
        const frequency = 2.0 / this.shader.uniforms.wavelength.value[i];
        const phase = this.shader.uniforms.speed.value[i] * frequency;
        const theta = this.shader.uniforms.direction.value[i].dot(new THREE.Vector2(x, y));
        return 2.0 * this.shader.uniforms.amplitude.value[i] * Math.pow((Math.sin(theta * frequency + this.shader.uniforms.time.value * phase) + 1.0) / 2.0, this.shader.uniforms.k.value);
    }

    _waveExp(i, x, y) {
        const frequency = 2.0 / this.shader.uniforms.wavelength.value[i];
        const phase = this.shader.uniforms.speed.value[i] * frequency;
        const theta = this.shader.uniforms.direction.value[i].dot(new THREE.Vector2(x, y));
        return this.shader.uniforms.amplitude.value[i] * Math.pow(Math.E, this.shader.uniforms.maxAmplitude.value * Math.sin(theta * frequency + this.shader.uniforms.time.value * phase) - this.shader.uniforms.waveOffset.value);
    }

    _wave(i, x, y) {
        const frequency = 2.0 / this.shader.uniforms.wavelength.value[i];
        const phase = this.shader.uniforms.speed.value[i] * frequency;
        const theta = this.shader.uniforms.direction.value[i].dot(new THREE.Vector2(x, y));
        return this.shader.uniforms.amplitude.value[i] * Math.sin(theta * frequency + this.shader.uniforms.time.value * phase);
    }

    _waveHeight(x, y, numOfWaves, WAVE_FUNCTION) {
        let height = 0.0;
        let a = x;
        let b = y;
        for (let i = 1; i < numOfWaves - 1; ++i) {
            if (WAVE_FUNCTION === 2) {
                x += this._dWavedxExp(i - 1, x, y);
                y += this._dWavedyExp(i - 1, x, y);
                height += this._waveExp(i, a, b);
            } else if (WAVE_FUNCTION === 1) {
                x += this._dWavedxPoly(i - 1, x, y);
                y += this._dWavedyPoly(i - 1, x, y);
                height += this._wavePoly(i, x, y);
            } else {
                x += this._dWavedx(i - 1, x, y);
                y += this._dWavedy(i - 1, x, y);
                height += this._wave(i, x, y);
            }
        }
        return height;
    }

    _waveNormal(x, y, numOfWaves, height, WAVE_FUNCTION) {
        let dx = 0.0;
        let dy = 0.0;
        for (let i = 1; i < numOfWaves - 1; ++i) {
            if (WAVE_FUNCTION === 2) {
                dx += this._dWavedxExp(i, x, y);
                dy += this._dWavedyExp(i, x, y);
            } else if (WAVE_FUNCTION === 1) {
                dx += this._dWavedxPoly(i, x, y);
                dy += this._dWavedyPoly(i, x, y);
            } else {
                dx += this._dWavedx(i, x, y);
                dy += this._dWavedy(i, x, y);
            }
        }
        const n = new THREE.Vector3(-dx, 1.0, -dy);
        return n.normalize();
    }
}

export default Water;