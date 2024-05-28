import { System } from "ape-ecs";

class BehaviorSystem extends System {
    init(clock) {
        this.scriptsQuery = this.world.createQuery().fromAll('Script').persist();
        this.clock = clock;
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
        this.scriptEntities.forEach(scriptEntity => {
            let scriptComponents = scriptEntity.getComponents('Script');
            scriptComponents.forEach(scriptComponent => {
                try {
                    scriptComponent.script.update(this.clock.getElapsedTime());
                }
                catch (e) {
                    console.error(e);
                    console.error('Your script generated an error it will not update');
                }
            });
        });
    }
}

export default BehaviorSystem;