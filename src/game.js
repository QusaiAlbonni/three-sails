import { Clock } from "three"
import GameWorld from "./world";

class Game {
    constructor(options){
        this.options = options

        this.options.fixedDeltaTime = 1 / this.options.tickRate
        
        this.clock = new Clock(false);

        this.update = this.update.bind(this);
        this.animationId = null

    }
    start() {
        this.gameWorld = new GameWorld(this.clock);
        this.gameWorld.init(this.options);
        if(this.animationId === null){
            this.clock.start();
            this.update(this.clock.getElapsedTime())
        }
    }
    update(time){
        this.animationId = requestAnimationFrame(this.update.bind(this));
        this.gameWorld.update();
    }
    stop(){
        if (this.animationId !== null){
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

export default Game;