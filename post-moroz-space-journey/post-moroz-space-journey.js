const finishStep = 120;
const countOfEmulatedGames = 10000000;
const bonusTurn = {
    7: true,
    22: true,
    55: true,
    70: true,
    77: true,
    93: true,
    104: true,
    115: true,
};
const skipTurn = {
    13: true,
    28: true,
    46: true,
    62: true,
    85: true,
    98: true,
    110: true,
};
const instaDeath = {
    39: true,
};
const arrowMoves = {
    4: 8,
    23: 9,
    24: 34,
    30: 20,
    42: 52,
    60: 50,
    65: 74,
    79: 88,
    101: 91,
    107: 112,
};
let Stats = {
    totalGames: countOfEmulatedGames,
    iterationGames: 500000,
    checkedGames: 0,
    games: [],
    catchedGames: 0,
    catchedGamesUnfair: 0,
    catchedMoreLoseGames: 0,
    firstPlayerWinCount: 0,
};

function main() {
    let newCountOfGames = Math.min(Stats.checkedGames + Stats.iterationGames, Stats.totalGames);

    for (0; Stats.checkedGames < newCountOfGames; Stats.checkedGames++) {
        Stats.games[Stats.checkedGames] = emulateGame();
    }

    if (Stats.checkedGames >= Stats.totalGames) {
        console.log('Progress: 100% Done');

        for (i = 0; i < Stats.totalGames; i++) {
            if (Stats.games[i].p1Catched > 0 || Stats.games[i].p2Catched > 0) {
                Stats.catchedGames++;
                if (Stats.games[i].p1Catched != Stats.games[i].p2Catched) {
                    Stats.catchedGamesUnfair++;
                }
            }

            if (Stats.games[i].p1Catched > Stats.games[i].p2Catched && Stats.games[i].winner == 'p2') {
                Stats.catchedMoreLoseGames++;
            } else if (Stats.games[i].p1Catched < Stats.games[i].p2Catched && Stats.games[i].winner == 'p1') {
                Stats.catchedMoreLoseGames++;
            }

            if (Stats.games[i].winner == 'p1') {
                Stats.firstPlayerWinCount++;
            }
        }

        console.log('Count of games: ' + Stats.totalGames.toLocaleString());
        console.log('Percent of games with at least one black hole: ' + formatedRound(Stats.catchedGames/Stats.totalGames) + '%');
        console.log('Percent of unfair games with black hole: ' + formatedRound(Stats.catchedGamesUnfair/Stats.totalGames) + '%');
        console.log('If go to black hole more times then lose: ' + formatedRound(Stats.catchedMoreLoseGames/Stats.catchedGamesUnfair) + '%');
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
        'turn': 0
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

    if (skipTurn[game[player]]) {
        game[anotherPlayer] += getDice();
        game = checkMove(game, anotherPlayer);
        game.turn++;
    }

    if (instaDeath[game[player]]) {
        game[player] = 0;
        game[player + 'Catched']++;
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
