const Alexa = require('./common_libs').Alexa;
const states = require('./common_libs').states;


const startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'LaunchRequest': function () {
        this.emit(':ask', this.t('WELCOME') + this.t('READY'), this.t('REPEAT'));
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', this.t('HELP'), this.t('HELP'));
    },

    'AMAZON.YesIntent': function () {
        this.emit(':ask', this.t('PLAYERS_NUMBER'));
    },

    'AMAZON.NoIntent': function () {
        this.response.speak('Ok, see you next time!');
        this.emit(':responseReady');
    },

    'NumberIntent': function () {
        const no_of_players = parseInt(this.event.request.intent.slots.number.value);
        this.attributes['players'] = no_of_players;
        this.handler.state = states.GUESSMODE;
        this.emitWithState('LaunchRequest');
    },

    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.attributes['endedSessionCount'] += 1;
        this.handler.state = '' // delete this.handler.state might cause reference errors
        delete this.attributes['STATE'];
        this.emit(':saveState', true);
    },

    'Unhandled': function () {
        const message = 'Say yes to continue, or no to end the game.';
        this.response.speak(message)
            .listen(message);
        this.emit(':responseReady');
    }
})

module.exports = startGameHandlers;