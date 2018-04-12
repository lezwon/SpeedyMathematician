const Alexa = require('./common_libs').Alexa;
const STATES = require('./common_libs').STATES;
const startGameHandlers = require('./startGameHandlers')
const guessStateHandlers = require('./guessStateHandlers')
const languageStrings = require('./language_strings')

const handler = {
    'LaunchRequest': function () {
        this.handler.state = STATES.STARTMODE;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.StopIntent': function () {
        this.emitWithState(':tell', this.t('GOODBYE'));
    }
}


exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = "amzn1.ask.skill.a6c7f4da-789b-4fc4-9b19-c17c7f4eee36";
    alexa.dynamoDBTableName = 'SpeedyMathematician';
    alexa.resources = languageStrings;
    alexa.registerHandlers(startGameHandlers, guessStateHandlers, handler);
    alexa.execute();
};