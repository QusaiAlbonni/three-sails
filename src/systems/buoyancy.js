import { System, Entity } from "ape-ecs";
import { ComponentDataError } from "../exceptions";
import { clamp } from "three/src/math/MathUtils.js";
import { Vector3 } from "three";
import { lerp } from "three/src/math/MathUtils.js";
import { log } from "three/examples/jsm/nodes/Nodes.js";
class BuoyancySystem extends System {
    init() {
        this.bodyQuery = this.world.createQuery().fromAll('Transform', 'RigidBody', 'BuoyantBody').persist(true);
    }
    update(currentTick) {
        let newEntities = this.bodyQuery.refresh().execute({
            updatedComponents: currentTick ,
            updatedValues: currentTick
        });
        for (let entity of newEntities) {
            let rb = entity.getOne('RigidBody')
            let buoy = entity.getOne('BuoyantBody')
            this.initBodies(buoy, rb, entity)
        }
        let entities = this.bodyQuery.refresh().execute();
        for (let entity of entities) {
            let rb = entity.getOne('RigidBody')
            let buoy = entity.getOne('BuoyantBody')
            let transform = entity.getOne('Transform').obj
            if (rb.isKinematic)
                this.updateBuoyancy(buoy, rb, transform)
        }
    }
    /**
     * 
     * @param {*} bb 
     * @param {*} rb 
     * @param {Entity} entity 
     */
    initBodies(bb, rb, entity) {
        if (bb.drawVoxels){
            let scene = entity.getOne('MeshFilter').scene;
            entity.addComponent({
                type: 'MeshFilter',
                key: 'meshFil',
                mesh: bb.voxelizedMesh.voxelMesh,
                scene: scene
            });
            console.log(entity.updatedComponents);
        }
    }
    updateBuoyancy(bb, rb, transform) {
        let V = bb.volume == null ? rb.volume : bb.volume;
        let m = bb.mass == null ? rb.mass : bb.mass;
        let density = m / V;
        let fluidDensity = bb.fluidDensity * bb.fluidDensityMultiplier;


        let voxels = bb.voxelizedMesh.voxels;
        let voxelCount = voxels.length
        let water = bb.water;

        let submergedVolume = 0.0
        let localVoxelHeight = bb.voxelizedMesh.voxelSize

        let voxelVolume = V / voxelCount
        let forceDensityFactor = (fluidDensity - density) * voxelVolume

        for (let index = 0; index < voxelCount; index++) {
            let worldPos = voxels[index].position.clone();
            worldPos.applyMatrix4(transform.matrixWorld);

            let waterHeight = bb.water.getHeightAtPos(worldPos.x, worldPos.z);
            let waterNormal = bb.water.getNormalAtPos(worldPos.x, worldPos.z)
            let depth = waterHeight - worldPos.y + localVoxelHeight;
            let voxelContrib = clamp(depth / localVoxelHeight, 0.0, 1.0);

            depth = clamp(depth, 0.0, 1.0)

            submergedVolume += voxelContrib;

            let displacmentVolume = Math.max(0.0, depth);
            waterNormal.multiplyScalar(this.world.gravity.y)
            let F = this.world.gravity.clone().multiplyScalar(-displacmentVolume * forceDensityFactor);
            rb.addForceAtPosition(F, worldPos)
        }
        submergedVolume = submergedVolume / voxelCount;

        if (bb.addDrag){
            rb.drag = lerp(bb.minimumWaterDrag, 1.0, submergedVolume);
            rb.angularDrag = lerp(bb.minimumWaterAngularDrag, 1.0,  submergedVolume);        
        }
        bb.voxelizedMesh.voxelMesh.position.copy(rb.position);
        bb.voxelizedMesh.voxelMesh.quaternion.copy(rb.rotation);
    }
}

export default BuoyancySystem;