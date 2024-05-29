import { System } from "ape-ecs";
import { clamp } from "three/src/math/MathUtils.js";

class BehaviorSystem extends System {
    init(clock, physicsClock) {
        this.scriptsQuery = this.world.createQuery().fromAll('Script').persist();
        this.clock = clock;
        this.physicsClock = physicsClock;
    }

    update(currentTick) {

        this.newScriptEntities = this.scriptsQuery.refresh().execute({
            updatedComponents: this.world.currentTick
        })
        this.newScriptEntities.forEach(scriptEntity => {
            let scriptComponents = scriptEntity.getComponents('Script');
            scriptComponents.forEach(scriptComponent => {
                scriptComponent.script.component = scriptComponent;
                scriptComponent.script.world = this.world;
                try {
                    scriptComponent.script.start();
                } catch (e) {
                    console.error("Your script generated an error it will not start properly");
                    console.error(e);
                }
            });
        })

        this.scriptEntities = this.scriptsQuery.refresh().execute();
        this._fixedUpdate(this.scriptEntities);



        this.scriptEntities.forEach(scriptEntity => {
            let scriptComponents = scriptEntity.getComponents('Script');
            scriptComponents.forEach(scriptComponent => {
                try {
                    scriptComponent.script.update(this.clock.getElapsedTime(), this.world.deltaTime);
                }
                catch (e) {
                    console.error(e);
                    console.error('Your script generated an error it will not update');
                }
            });
        });


    }
    _fixedUpdate(entities) {
        this.world.accumulatedPhyTime += this.world.deltaTime;
        this.world.accumulatedPhyTime = clamp(this.world.accumulatedPhyTime, 0, this.world.maxTickTime)
        while (this.world.accumulatedPhyTime >= this.world.fixedDeltaTime) {
            entities.forEach(scriptEntity => {
                let scriptComponents = scriptEntity.getComponents('Script');
                scriptComponents.forEach(scriptComponent => {
                    try {
                        scriptComponent.script.fixedUpdate(this.clock.getElapsedTime(), this.world.fixedDeltaTime);
                    }
                    catch (e) {
                        console.error(e);
                        console.error('Your script generated an error it will not update');
                    }
                });
            });

            this.world.accumulatedPhyTime -= this.world.fixedDeltaTime;
        }
    }

}

export default BehaviorSystem;