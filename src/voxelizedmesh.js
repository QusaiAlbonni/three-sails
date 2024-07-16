import * as THREE from 'three'
import { isInsideMesh } from './utils'
class VoxelizedMesh {

    /**
     * 
     * @param {THREE.Mesh | THREE.Scene} mesh 
     * @param {Number} voxelSize 
     * @param {Number} gridResolution
     * @param {THREE.Material} material 
     */
    constructor(mesh, voxelSize, gridResolution, boundingBoxOffset = { x: 0.0, y: 0.0, z: 0.0 }, material, useSceneMaterial = false) {
        this.mesh = mesh
        this.voxelSize = voxelSize
        this.gridResolution = gridResolution
        this.boundingBoxOffset = boundingBoxOffset
        this.useSceneMaterial = false
        if (material === undefined)
            this.material = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                side: THREE.DoubleSide
            })
        else
            this.material = material
        this.voxels = []
        this.voxelMesh = new THREE.InstancedMesh()

        if (this.mesh.isGroup)
            this.voxelizeScene(this.mesh)
        else
            this.voxelizeMesh(this.mesh)

        this.instantiateVoxelMesh(this.voxels)
    }

    voxelizeMesh(mesh) {
        let boundingBox = new THREE.Box3().setFromObject(mesh);
        boundingBox.min.y += this.boundingBoxOffset.y * this.gridResolution
        boundingBox.min.x += this.boundingBoxOffset.x * this.gridResolution
        boundingBox.min.z += this.boundingBoxOffset.z * this.gridResolution

        for (let i = boundingBox.min.x; i < boundingBox.max.x; i += this.gridResolution) {
            for (let j = boundingBox.min.y; j < boundingBox.max.y; j += this.gridResolution) {
                for (let k = boundingBox.min.z; k < boundingBox.max.z; k += this.gridResolution) {
                    const pos = new THREE.Vector3(i, j, k)
                    if (isInsideMesh(pos, mesh)) {
                        this.voxels.push({
                            position: pos
                        })
                    }
                }
            }
        }
    }

    voxelizeScene(scene) {
        const importedMeshes = [];
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material.side = THREE.DoubleSide
                importedMeshes.push(child)
            }
        });

        let boundingBox = new THREE.Box3().setFromObject(scene)
        const size = boundingBox.getSize(new THREE.Vector3())
        const center = boundingBox.getCenter(new THREE.Vector3())

        scene.position.copy(center)

        boundingBox = new THREE.Box3().setFromObject(scene)

        for (let i = boundingBox.min.x; i < boundingBox.max.x; i += this.gridResolution) {
            for (let j = boundingBox.min.y; j < boundingBox.max.y; j += this.gridResolution) {
                for (let k = boundingBox.min.z; k < boundingBox.max.z; k += this.gridResolution) {
                    for (let meshCnt = 0; meshCnt < importedMeshes.length; meshCnt++) {
                        const pos = new THREE.Vector3(i, j, k)
                        const mesh = importedMeshes[meshCnt]

                        const color = new THREE.Color()
                        const { h, s, l } = mesh.material.color.getHSL(color)
                        color.setHSL(h, s * .8, l * .8 + .2)

                        if (isInsideMesh(pos, mesh)) {
                            this.voxels.push({ color: color, position: pos })
                        }
                    }
                }
            }
        }

    }


    instantiateVoxelMesh(voxels) {
        let voxelGeometry = new THREE.BoxGeometry(this.voxelSize, this.voxelSize, this.voxelSize)
        let voxelMaterial = this.material
        let instancedMesh = new THREE.InstancedMesh(voxelGeometry, voxelMaterial, voxels.length)
        instancedMesh.castShadow = true
        instancedMesh.receiveShadow = true
        this.voxelMesh = instancedMesh

        let dummyObj = new THREE.Object3D()

        for (let i = 0; i < voxels.length; i++) {
            dummyObj.position.copy(voxels[i].position)
            dummyObj.updateMatrix()
            instancedMesh.setMatrixAt(i, dummyObj.matrix)
            if (this.mesh.isGroup && this.useSceneMaterial)
                instancedMesh.setColorAt(i, voxels[i].color)
        }
        if (this.mesh.isGroup)
            instancedMesh.instanceColor.needsUpdate = true;
        instancedMesh.instanceMatrix.needsUpdate = true
    }
}

export default VoxelizedMesh