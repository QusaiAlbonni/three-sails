import { components } from "../components";

class Behavior {
    start() {

    }

    update() {

    }

    destroy() {

    }

    get entity() {
        try {
            return this.component.entity;
        }
        catch (e) {
            console.error(e);
            console.error('You probably called this outside an entity');
        }
    }

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

    get mesh(){
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

    createQuery(args){
        return this.world.createQuery(args);
    }


}

export default Behavior;