import { components } from "../components";
import * as THREE from 'three'

class Behavior {
    start() {

    }

    update() {

    }

    destroy() {

    }
    /**
     * the entity this script belongs to
     * @type {Entity}
     */
    get entity() {
        try {
            return this.component.entity;
        }
        catch (e) {
            console.error(e);
            console.error('You probably called this outside an entity');
        }
    }
    /**
     * the tranform of the entity
     * @type {THREE.Object3D}
     */
    get transform() {
        try {
            let component = this.component.entity.getOne('Transform');
            if (component !== undefined) {
                return component.obj;
            }
            return undefined;
        }
        catch (e) {
            console.error(e);
            console.error('You probably called this outside an entity');
        }
    }
    /**
     * the mesh of this entity
     * @type {THREE.Object3D}
     */
    get mesh() {
        let component;
        try {
            component = this.component.entity.getOne('MeshFilter');
        }
        catch (e) {
            console.error(e);
            console.error('You probably called this outside an entity');
            return;
        }
        if (component === undefined)
            return undefined;
        return component.mesh;
    }
    /**
     * the scene this entity belongs to
     * @type {THREE.Scene}
     */
    get scene() {
        let component;
        try {
            component = this.component.entity.getOne('MeshFilter');
        }
        catch (e) {
            console.error(e);
            console.error('You probably called this outside an entity');
            return;
        }
        if (component === undefined)
            return undefined;
        return component.scene;
    }

    createQuery(args) {
        return this.world.createQuery(args);
    }


}

export default Behavior;