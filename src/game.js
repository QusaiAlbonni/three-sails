import { Clock } from "three"
import GameWorld from "./world";

class Game {
    constructor(options){
        this.options = {}
        Object.assign(this.options, options)
        
        this.clock = new Clock();

        this.update = this.update.bind(this);
        this.animationId = null

    }
    start() {
        this.gameWorld = new GameWorld();
        this.gameWorld.init();
        if(this.animationId === null){
            this.update(this.clock.getElapsedTime())
        }
    }
    update(time){
        this.animationId = requestAnimationFrame(this.update.bind(this));
        
        this.gameWorld.update(time);
    }
    stop(){
        if (this.animationId !== null){
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

export default Game;