const finishStep = 93;
const countOfEmulatedGames = 100000000;
const bonusTurn = {
    9: true,
    24: true,
    43: true,
    56: true,
    82: true,
    84: true,
};
const moveBack = {};
const skipTurn = {
    2: true,
    8: true,
    11: true,
    21: true,
    23: true,
    28: true,
    29: true,
    32: true,
    39: true,
    44: true,
    45: true,
    49: true,
    58: true,
    59: true,
    68: true,
    73: true,
};
const instaDeath = {
    12: true,
};
const arrowMoves = {
    3: 5,
    4: 9,
    6: 27,
    13: 14,
    16: 18,
    19: 20,
    26: 46,
    30: 33,
    31: 36,
    34: 35,
    37: 38,
    40: 43,
    41: 46,
    51: 36,
    53: 54,
    57: 10,
    60: 47,
    61: 63,
    64: 67,
    65: 67,
    66: 46,
    69: 67,
    70: 10,
    72: 55,
    74: 78,
    75: 55,
    76: 78,
    77: 10,
    79: 78,
    83: 84,
    86: 87,
    88: 48,
    90: 10,
    91: 93,
};
const bigBack = {
    57: true,
    70: true,
    77: true,
    88: true,
    90: true,
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
        console.log('Percent of games with at least one big-back: ' + formatedRound(Stats.catchedGames/Stats.totalGames) + '%');
        console.log('Percent of unfair games with big-back: ' + formatedRound(Stats.catchedGamesUnfair/Stats.totalGames) + '%');
        console.log('If step to big-back more times then lose: ' + formatedRound(Stats.catchedMoreLoseGames/Stats.catchedGamesUnfair) + '%');
        console.log('--------------------');
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

    if (bigBack[game[player]]) {
        game[player + 'Catched']++;
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
        //game[player + 'Catched']++; // skiped because zero return here almost at the start
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
