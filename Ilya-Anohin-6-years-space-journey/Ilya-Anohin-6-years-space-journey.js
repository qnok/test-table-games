const finishStep = 509;
const countOfEmulatedGames = 100000000;
const bonusTurn = {
    7: true,
    14: true,
    26: true,
    42: true,
    64: true,
    83: true,
    98: true,
    107: true,
    115: true,
    134: true,
    151: true,
    171: true,
    184: true,
    202: true,
    225: true,
    234: true,
    254: true,
    267: true,
    283: true,
    311: true,
    323: true,
    349: true,
    360: true,
    389: true,
    404: true,
    435: true,
    452: true,
    470: true,
    483: true,
};
const moveBack = {
    16: true,
    41: true,
    73: true,
    109: true,
    139: true,
    165: true,
    194: true,
    290: true,
    314: true,
    332: true,
    351: true,
    367: true,
    385: true,
    399: true,
    445: true,
};
const skipTurn = {
    21: true,
    34: true,
    57: true,
    89: true,
    103: true,
    125: true,
    126: true,
    127: true,
    128: true,
    143: true,
    160: true,
    192: true,
    212: true,
    242: true,
    274: true,
    297: true,
    316: true,
    335: true,
    373: true,
    383: true,
    396: true,
    415: true,
    426: true,
    443: true,
    476: true,
    494: true,
    502: true,
};
const instaDeath = {
    15: true,
    75: true,
    112: true,
    164: true,
};
const instaVictory = {
    32: true,
    55: true,
    321: true,
    429: true,
};
const arrowMoves = {
    1: 119,
    3: 13,
    18: 30,
    23: 148,
    36: 51,
    53: 43,
    58: 72,
    78: 93,
    85: 208,
    99: 110,
    145: 129,
    153: 264,
    158: 166,
    176: 167,
    178: 200,
    215: 236,
    231: 219,
    233: 319,
    240: 324,
    243: 253,
    258: 264,
    261: 271,
    278: 296,
    299: 286,
    301: 312,
    329: 341,
    343: 408,
    345: 359,
    375: 393,
    388: 442,
    409: 425,
    439: 433,
    447: 457,
    464: 460,
    486: 492,
};
let Stats = {
    totalGames: countOfEmulatedGames,
    iterationGames: 1000000,
    checkedGames: 0,
    turnsToGames: {},
    turnsToGamesPoints: {},
    catchedGames: 0,
    catchedGamesUnfair: 0,
    catchedMoreLoseGames: 0,
    firstPlayerWinCount: 0,
    totalTurns: 0,
    victoriesByWormhole: 0,
    maxCountOfTurns: 0,
    minCountOfTurns: 999999,
};

function main() {
    let newCountOfGames = Math.min(Stats.checkedGames + Stats.iterationGames, Stats.totalGames);

    for (0; Stats.checkedGames < newCountOfGames; Stats.checkedGames++) {
        let game = emulateGame();

        Stats.totalTurns += game.turn;
        if (typeof Stats.turnsToGames[game.turn] === 'undefined') {
            Stats.turnsToGames[game.turn] = 0;
        }
        Stats.turnsToGames[game.turn]++;
        Stats.maxCountOfTurns = Math.max(Stats.maxCountOfTurns, game.turn);
        Stats.minCountOfTurns = Math.min(Stats.minCountOfTurns, game.turn);

        if (game.p1Catched > 0 || game.p2Catched > 0) {
            Stats.catchedGames++;
            if (game.p1Catched != game.p2Catched) {
                Stats.catchedGamesUnfair++;
            }
        }

        if (game.p1Catched > game.p2Catched && game.winner == 'p2') {
            Stats.catchedMoreLoseGames++;
        } else if (game.p1Catched < game.p2Catched && game.winner == 'p1') {
            Stats.catchedMoreLoseGames++;
        }

        if (game.winner == 'p1') {
            Stats.firstPlayerWinCount++;
        }

        if (game.victoryByWormhole) {
            Stats.victoriesByWormhole++;
        }
    }

    if (Stats.checkedGames >= Stats.totalGames) {
        console.log('Progress: 100% Done');

        Object.keys(Stats.turnsToGames).forEach(key => {
            Stats.turnsToGamesPoints[key] = 100*Stats.turnsToGames[key]/Stats.totalGames;
        });

        console.log('Count of games: ' + Stats.totalGames.toLocaleString());
        console.log('Average count of turns: ' + Math.round(100*Stats.totalTurns/Stats.totalGames)/100);
        console.log(JSON.stringify(Stats.turnsToGamesPoints));
        console.log('Max count of turns: ' + Stats.maxCountOfTurns);
        console.log('Min count of turns: ' + Stats.minCountOfTurns);
        console.log('--------------------');
        console.log('Percent of games with at least one black hole: ' + formatedRound(Stats.catchedGames/Stats.totalGames) + '%');
        console.log('Percent of unfair games with black hole: ' + formatedRound(Stats.catchedGamesUnfair/Stats.totalGames) + '%');
        console.log('If go to black hole more times then lose: ' + formatedRound(Stats.catchedMoreLoseGames/Stats.catchedGamesUnfair) + '%');
        console.log('--------------------');
        console.log('Victories by wormhole: ' + formatedRound(Stats.victoriesByWormhole/Stats.totalGames) + '%');
        console.log('First player win rate: ' + formatedRound(Stats.firstPlayerWinCount/Stats.totalGames) + '%');
    } else {
        setTimeout(
            function() {
                console.log('Progress: ' + formatedRound(Stats.checkedGames/Stats.totalGames) + '%');
                main();
            },
            0
        );
    }
}

function emulateGame() {
    let game = {
        'p1': 0,
        'p2': 0,
        'winner': null,
        'p1Catched': 0,
        'p2Catched': 0,
        'turn': 0,
        'victoryByWormhole': false,
    }

    while(true) {
        game.turn++;

        game.p1 += getDice();
        game = checkMove(game, 'p1');

        if (game.p1 >= finishStep) {
            game.winner = 'p1';
            break;
        }

        game.p2 += getDice();
        game = checkMove(game, 'p2');

        if (game.p2 >= finishStep) {
            game.winner = 'p2';
            break;
        }
    }

    return game;
}

function checkMove(game, player) {
    let anotherPlayer = 'p1';
    if (player == anotherPlayer) {
        anotherPlayer = 'p2';
    }

    if (bonusTurn[game[player]]) {
        game[player] += getDice();
        game = checkMove(game, player);
    }

    if (moveBack[game[player]]) {
        game[player] -= getDice();
        game = checkMove(game, player);
    }

    if (skipTurn[game[player]]) {
        game[anotherPlayer] += getDice();
        game = checkMove(game, anotherPlayer);
        game.turn++;
    }

    if (instaDeath[game[player]]) {
        game[player] = 0;
        game[player + 'Catched']++;
    }

    if (instaVictory[game[player]]) {
        game[player] = finishStep;
        game.victoryByWormhole = true;
    }

    if (typeof arrowMoves[game[player]] !== 'undefined') {
        game[player] = arrowMoves[game[player]];
    }

    return game;
}

function formatedRound(value) {
    return Math.round(10000*value)/100;
}

function getDice() {
    return Math.floor(Math.random() * 6 + 1);
}

main();
