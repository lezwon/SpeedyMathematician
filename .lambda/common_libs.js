const alexa = require('alexa-sdk');

module.exports = {
    Alexa: alexa,

    STATES: {
        FIRST_USE: '',
        GUESSMODE: '_GUESSMODE', // User is trying to guess the number.
        STARTMODE: '_STARTMODE' // Prompt the user to start or restart the game.
    },

    MODES: {
        DEFAULT: 0,
        EXPLANATION: 1,
        ROUND_COMPLETION: 2
    },

}
