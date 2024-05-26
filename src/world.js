import { World } from "ape-ecs";
import { components, tags } from "./components";
import { entities } from "./entities";
import systems from "./systems/systems";

class GameWorld {
    constructor(){
        this._world = new WorldManager({
            world: new World(),
        }) 
    }

    init(time){
        this._world.registerComponents(components);
        this._world.registerTags(tags);
        this._world.createEntities(entities);
        this._world.registerSystems(systems);
    }
    update(){
        this.tick = this._world.runSystems();
    }


}

class WorldManager {
    constructor(options){
        this.world = options.world;
    }

    registerSystems(systems){
        for (let index = 0; index < systems.length; index++) {
            this.world.registerSystem('mainSystems', systems[index]);
        }
    }

    registerComponents(components){
        for (let index = 0; index < components.length; index++) {
            this.world.registerComponent(components[index]);
        }
    }

    registerTags(tags){
        this.world.registerTags(...tags);
    }

    runSystems(){
        this.world.runSystems('mainSystems');
        this.world.tick();

        return this.world.currentTick;
    }

    createEntities(entities){
        this.world.createEntities(entities);
    }
    
}

export default GameWorld;