const alexa = require('alexa-sdk');

const Service =  {
    Alexa: alexa,

    STATES: {
        FIRST_USE: '',
        GUESSMODE: '_GUESSMODE',
        STARTMODE: '_STARTMODE',
        SQUARE: '_SQUARE',
        FACTORIAL: '_FACTORIAL',
        TRUEFALSE: '_TRUEFALSE'
    },

    MODES: {
        DEFAULT: '_DEFAULT',
        EXPLANATION: '_EXPLANATION',
        ROUND_COMPLETION: '_ROUND_COMPLETION',
        PLAY_AGAIN: '_PLAY_AGAIN'
    },

    RESULT: {
        SINGLE_WINNER: '_SINGLE_WINNER',
        DRAW: '_DRAW'
    },

    SPEECHCONS: {
        CORRECT: ["balle balle", "All righty", "Bam", "Bazinga", "Bingo", "Boom", "Bravo", "Cha Ching", "Hip hip hooray", "Hurray", "Huzzah", "Oh dear.  Just kidding.  Hurray", "Kaboom", "Kaching", "Righto", "Way to go", "Well done", "Whee", "Woo hoo", "Wowza", "Yowsa"],
        INCORRECT: ["Aiyo", "Argh", "Aw man", "Blarg", "Blast", "Boo", "Bummer", "Darn", "D'oh", "Dun dun dun", "Eek", "Honk", "Le sigh", "Oh boy", "Oh dear", "Oof", "Ouch", "Shucks", "Uh oh", "Whoops a daisy"]
    },

    ANSWER_RESULT: {
        UNINITIALIZED: '_UNINITIALIZED',
        CORRECT: '_CORRECT',
        INCORRECT: '_INCORRECT'
    },


    HELPERS: {
        randomPhrase: function (myData) {
            let i = Math.floor(Math.random() * myData.length);
            return (myData[i]);
        },

        getAllIndexes: function (arr, val) {
            var indexes = [], i;
            for (i = 0; i < arr.length; i++)
                if (arr[i] === val)
                    indexes.push(i);
            return indexes;
        },

        calculateResults: function (points, no_players) {
            let results = {}
            let pointsArray = Object.values(points)

            let max = Math.max(...pointsArray);
            let indexes = this.getAllIndexes(pointsArray, max);
            results["type"] = indexes.length == 1 ? Service.RESULT.SINGLE_WINNER : Service.RESULT.DRAW;
            results["max"] = max;
            results["winners"] = indexes.map (val => val +1);

            return results;
        }
    }

}

module.exports = Service;