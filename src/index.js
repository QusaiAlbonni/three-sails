import { Vector3 } from "three";
import Game from "./game";

const options = {
    tickRate: 128,
    maxTickTime: 0.2,
    gravity: new Vector3(0.0, -9.81, 0.0),
    accumulatedPhyTime: 0
}

// you can run a script called personal.js instead to run test/debug code

const game = new Game(options);

game.start();
