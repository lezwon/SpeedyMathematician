const alexa = require('alexa-sdk');

module.exports = {
    Alexa: alexa,

    states: {
        GUESSMODE: '_GUESSMODE', // User is trying to guess the number.
        STARTMODE: '_STARTMODE' // Prompt the user to start or restart the game.
    }
}
