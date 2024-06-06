import { System } from "ape-ecs";
import { clamp } from "three/src/math/MathUtils.js";

class PhysicsSystem extends System {
    init(clock, physicsClock) {
        this.scriptsQuery = this.world.createQuery().fromAll('Script').persist();
        this.rigidbodyQuery = this.world.createQuery().fromAll('Transform', 'RigidBody').persist();
        this.clock = clock;
        this.physicsClock = physicsClock;
    }

    update(currentTick) {
        let scriptEntities = this.scriptsQuery.refresh().execute();
        this._fixedUpdate(scriptEntities);
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
    updateBodyVelocity(body){
        
    }

    updateBodyAngularVelocity(body){

    }

    updateBodyPosition(body){

    }

    updateBodyRotation(body){

    }
}

export default PhysicsSystem;