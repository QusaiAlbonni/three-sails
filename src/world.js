import { World } from "ape-ecs";
import { components, tags } from "./components";
import { entities } from "./entities";
import systems from "./systems/systems";
import { Clock } from "three";

class GameWorld {
    constructor(clock){
        this._world = new WorldManager({
            world: new World(),
            clock: clock
        }) 
    }

    init(args){
        args.accumulatedPhyTime = 0;
        this._world.worldConfigutaion(args);

        this._world.registerComponents(components);
        this._world.registerTags(tags);
        this._world.createEntities(entities);
        this._world.registerSystems(systems);
    }
    update(){
        this._world.updateTime();
        this.tick = this._world.runSystems();
    }


}

class WorldManager {

    constructor(options){
        this.world = options.world;
        this.clock = options.clock;
        this.physicsClock = new Clock();
    }
    worldConfigutaion(configs){
        Object.entries(configs).forEach(([key, info]) => {
            this.world[key] = info;
        });
    }

    registerSystems(systems){
        for (let index = 0; index < systems.length; index++) {
            this.world.registerSystem('mainSystems', systems[index], [this.clock, this.physicsClock]);
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

    updateTime(){
        this.world.deltaTime = this.clock.getDelta();
        this.world.physicsDeltaTime = this.physicsClock.getDelta();
    }
    
}

export default GameWorld;