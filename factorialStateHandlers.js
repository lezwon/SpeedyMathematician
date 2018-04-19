const Alexa = require('./common_libs').Alexa;
const STATES = require('./common_libs').STATES;
const MODES = require('./common_libs').MODES;
const RESULT = require('./common_libs').RESULT;
const SPEECHCONS = require('./common_libs').SPEECHCONS;
const HELPERS = require('./common_libs').HELPERS;
const ANSWER_RESULT = require('./common_libs').ANSWER_RESULT;
const util = require('util')


function fact(number) {
    res = 1
    while(number)
        res *= number--
    return res
}

const guessModeHandlers = Alexa.CreateStateHandler(STATES.FACTORIAL, {

    'LaunchIntent': function () {
        let round = this.attributes['round']
        this.attributes['prev_numbers'] = []
        this.attributes['question'] = 1
        this.attributes['solved'] = false
        this.attributes['mode'] = MODES.EXPLANATION
        this.attributes['current_player'] = 1
        this.attributes['answer_result'] = ANSWER_RESULT.UNINITIALIZED
        this.attributes['points'] = {};
        this.emit(':ask', this.t('START_GAME') + ' ROUND ' + round + '. ' + this.t('FACTORIAL'))
    },

    'QuestionIntent': function () {
        // round, question, player
        let question_no = this.attributes['question']
        let current_player = this.attributes['current_player']
        var points = this.attributes['points'] ? this.attributes['points'] : {}
        let round_no = this.attributes['round']
        let answer_result = this.attributes['answer_result']
        let round_completed_speech = '';
        let points_speech = ''
        let winners_speech = ''

        if (answer_result == ANSWER_RESULT.CORRECT)
            prev_speech = util.format(this.t('CORRECT'), HELPERS.randomPhrase(SPEECHCONS.CORRECT), this.attributes['answer']);
        else if (answer_result == ANSWER_RESULT.INCORRECT)
            prev_speech = util.format(this.t('WRONG_FACTORIAL'), HELPERS.randomPhrase(SPEECHCONS.INCORRECT), this.attributes['guessNumber'], this.attributes['number'], this.attributes['answer']);
        else
            prev_speech = this.t('BEGIN_GAME');

        if (round_no <= 3) {
            if (question_no <= 3) {
                if (current_player <= this.attributes['players']) {
                    let number = Math.floor(Math.random() * 6) + 4;
                    while (number == this.attributes['number'] || this.attributes['prev_numbers'].includes(number))
                        number = Math.floor(Math.random() * 6) + 4;

                    this.attributes['prev_numbers'].push(number)

                    let factorial = fact(number);
                    let question = util.format(this.t('QUESTION_FACORIAL'), question_no, current_player, number);
                    this.attributes['number'] = number;
                    this.attributes['answer'] = factorial;

                    this.attributes['current_player']++
                    console.log(prev_speech)
                    this.emit(':ask', prev_speech + question);
                    return;
                }

                this.attributes['question']++;
                this.attributes['current_player'] = 1
                this.emitWithState('QuestionIntent')
                return
            }


            round_completed_speech = util.format(this.t('ROUND_COMPLETED'), round_no);

            for (var player in points) {
                if (points.hasOwnProperty(player)) {
                    points_speech += util.format(this.t('POINTS'), points[player], parseInt(player));
                }
            }

            let results = HELPERS.calculateResults(points, this.attributes['players']);

            finalScore = this.attributes['finalScore'] ? this.attributes['finalScore'] : {};

            for (let i = 0; i < results.winners.length; i++) {
                let player = results.winners[i];
                finalScore[player] = finalScore[player] ? finalScore[player] + 1 : 1
            }

            this.attributes['finalScore'] = finalScore

            switch (results.type) {
                case RESULT.SINGLE_WINNER:
                    winners_speech = util.format(this.t('SINGLE_WINNER'), results.winners[0], results.max);
                    break;

                case RESULT.DRAW:
                    let draw_speech = results.winners.slice(0, results.winners.length - 1).join(', ') + ", and " + results.winners.slice(-1);
                    winners_speech = util.format(this.t('DRAW'), draw_speech, results.max);
                    break;

                default:
                    break;
            }

            this.attributes['question'] = 1
            this.attributes['current_player'] = 1
            this.attributes['correct'] = 0
            this.attributes['round']++;

            if (round_no == 3) {
                let finalResults = HELPERS.calculateResults(finalScore, this.attributes['players']);

                switch (finalResults.type) {
                    case RESULT.SINGLE_WINNER:
                        next_round = util.format(this.t('GAME_FINISHED_WINNER'), finalResults.winners[0]);
                        break;

                    case RESULT.DRAW:
                        let draw_speech = finalResults.winners.slice(0, finalResults.winners.length - 1).join(', ') + ", and " + finalResults.winners.slice(-1);
                        next_round = util.format(this.t('GAME_FINISHED_DRAW'), draw_speech);
                        break;

                    default:
                        break;
                }
                this.handler.state = STATES.STARTMODE
            }
            else {
                next_round = util.format(this.t('NEXT_ROUND'), this.attributes['round'])
                this.attributes['mode'] = MODES.ROUND_COMPLETION
                this.attributes['solved'] = false
            }
            this.emit(':ask', prev_speech + round_completed_speech + points_speech + winners_speech + next_round)
        }

    },

    'AMAZON.YesIntent': function () {

        let solved = this.attributes['solved']

        switch (this.attributes['mode']) {
            case MODES.EXPLANATION:
                if (!solved) {
                    this.attributes['solved'] = true
                    this.emit(':ask', this.t('SQUARE_EXPLAIN'));
                }
                else {
                    this.emitWithState('QuestionIntent')
                }
                break;

            case MODES.ROUND_COMPLETION:
                if (!solved) {
                    this.attributes['solved'] = true
                    let next_round = this.attributes['round'] - 1;
                    let shuffledRounds = this.attributes['roundOrder']
                    this.handler.state = shuffledRounds[next_round]
                    this.emitWithState('LaunchIntent')
                }
                else {
                    this.emit(':tell', this.t('GOODBYE'));
                }
                break;

            default:

                break;
        }


    },

    'AMAZON.NoIntent': function () {

        let solved = this.attributes['solved']

        switch (this.attributes['mode']) {
            case MODES.EXPLANATION:
                if (solved) {
                    this.attributes['solved'] = false
                    this.emit(':ask', this.t('EXPLAIN_AGAIN'));
                }
                else {
                    this.emitWithState('QuestionIntent')
                }
                break;

            case MODES.ROUND_COMPLETION:
                if (!solved) {
                    this.attributes['solved'] = true
                    this.emit(':ask', "Do you wish to quit?");
                }
                else {
                    this.attributes['solved'] = false
                    this.emit(':ask', "Should we proceed to the next round then?");
                }
                break;

            default:

                break;
        }

    },

    'NumberIntent': function () {
        const guessNum = parseInt(this.event.request.intent.slots.number.value);
        const targetNum = this.attributes['answer'];
        var points = this.attributes['points'] ? this.attributes['points'] : {}
        let current_player = parseInt(this.attributes['current_player'].toString()) - 1

        this.attributes['guessNumber'] = guessNum;
        points[current_player] = points[current_player] ? points[current_player] : 0;

        if (guessNum == targetNum) {
            points[current_player]++;
            this.attributes['answer_result'] = ANSWER_RESULT.CORRECT
        } else {
            this.attributes['answer_result'] = ANSWER_RESULT.INCORRECT
        }

        this.attributes['points'] = points;
        this.emitWithState('QuestionIntent')
    },

    'SessionEndedRequest': function () {
        this.handler.state = STATES.FIRST_USE;
        delete this.attributes['STATE'];
        delete this.attributes['round'];
        this.emit(':saveState', false); // Be sure to call :saveState to persist your session attributes in DynamoDB
    },

    'Unhandled': function () {
        this.response.speak('Sorry, I didn\'t get that. Try saying a number.')
            .listen('Try saying a number.');
        this.emit(':responseReady');
    },

    'AMAZON.CancelIntent': function () {
        this.handler.state = STATES.FIRST_USE;
        delete this.attributes['STATE'];
        this.emitWithState('AMAZON.StopIntent');
    },

    'AMAZON.StopIntent': function () {
        this.handler.state = STATES.FIRST_USE;
        delete this.attributes['STATE'];
        this.emitWithState('AMAZON.StopIntent');
    }
});

module.exports = guessModeHandlers;