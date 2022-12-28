const finishStep = 99;
const countOfEmulatedGames = 100000000;
const bonusTurn = {
    14: true,
    62: true,
    70: true,
    84: true,
    92: true,
};
const moveBack = {};
const skipTurn = {
    22: true,
    46: true,
    48: true,
    52: true,
    54: true,
    57: true,
    60: true,
    69: true,
    82: true,
    87: true,
};
const instaDeath = {
    13: true,
    63: true,
};
const arrowMoves = {
    9: 8,
    12: 11,
    16: 3,
    21: 20,
    24: 27,
    28: 8,
    31: 30,
    34: 36,
    40: 59,
    42: 45,
    44: 35,
    61: 81,
    65: 74,
    66: 53,
    67: 72,
    75: 35,
    77: 79,
    83: 81,
    85: 88,
    91: 71,
    96: 97,
};
const bigBack = {
    63: true,
    75: true,
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
