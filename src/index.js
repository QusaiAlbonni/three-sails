import Game from "./game";

const options = {
    tickRate: 50,
    maxTickTime: 0.1
}

// you can run a script called personal.js instead to run test/debug code

const game = new Game(options);

game.start();
