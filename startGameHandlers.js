const Alexa = require('./common_libs').Alexa;
const STATES = require('./common_libs').STATES;


const startGameHandlers = Alexa.CreateStateHandler(STATES.STARTMODE, {
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
        this.handler.state = STATES.FIRST_USE;
        this.emitWithState('AMAZON.StopIntent');
    },

    'NumberIntent': function () {
        const no_of_players = parseInt(this.event.request.intent.slots.number.value);
        this.attributes['players'] = no_of_players;
        this.handler.state = STATES.GUESSMODE;
        this.emitWithState('LaunchIntent');
    },

    'SessionEndedRequest': function () {
        this.handler.state = STATES.FIRST_USE;
        delete this.attributes['STATE'];
        this.emitWithState(':saveState', false);
    },

    'Unhandled': function () {
        const message = 'Say yes to continue, or no to end the game.';
        this.response.speak(message)
            .listen(message);
        this.emitWithState(':responseReady');
    }
})

module.exports = startGameHandlers;