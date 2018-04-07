const Alexa = require('./common_libs').Alexa;
const states = require('./common_libs').states;

const guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {

    'LaunchRequest': function () {
        let round = 1
        this.attributes['round'] = round
        this.attributes['question'] = 1
        this.attributes['explain'] = 1
        this.attributes['current_player'] = 1
        let points = []
        this.attributes['points'] = JSON.stringify(points);
        this.emit(':ask', this.t('START_GAME') + ' ROUND ' + round +'. '+ this.t('SQUARE'))
    },

    'QuestionIntent': function () {
        // round, question, player
        let question_no = this.attributes['question']
        let current_player = this.attributes['current_player']

        if (question_no <= 3){
            if(current_player <= this.attributes['players']){
                this.attributes['current_player']++
                let number = Math.floor(Math.random() * 10) + 6;
                let square = Math.pow(number,2);
                this.attributes['number'] = number;
                this.attributes['answer'] = square;
                let prev_speech = this.attributes['data']
                prev_speech = prev_speech == undefined ? '':prev_speech
                this.emit(':ask',  prev_speech + ' Question ' + question_no + ' for Player ' + current_player + '. What is the square of ' + number + '?');
                return;
            }

            this.attributes['question']++;
            this.attributes['current_player'] = 1
            this.emitWithState('QuestionIntent')
        }

      
    },

    'AMAZON.YesIntent': function () {
        if (this.attributes['explain']){
            this.attributes['explain'] = 0
            this.emit(':ask', this.t('SQUARE_EXPLAIN'));
        }
        else{
            this.emitWithState('QuestionIntent')
        }
        
    },

    'AMAZON.NoIntent': function () {
        if (!this.attributes['explain']){
            this.attributes['explain'] = 1
            this.emit(':ask', this.t('EXPLAIN_AGAIN'));
        }
        else {
            this.emitWithState('QuestionIntent')
        }
    },

    'NumberIntent': function () {
        const guessNum = parseInt(this.event.request.intent.slots.number.value);
        const targetNum = this.attributes['answer'];
        var points = this.attributes['points'] ? JSON.parse(this.attributes['points']) : {}
        let current_player = this.attributes['current_player'].toString();

        
        

        if (guessNum == targetNum) {

            points[current_player] = 2

            this.attributes['points'] = JSON.stringify(points);
            this.attributes['data'] = "<say-as interpret-as='interjection'>WooHoo!</say-as>! " + guessNum.toString() + ' is correct!'
            this.emitWithState('QuestionIntent')
            
        } else {
            this.attributes['data'] = "<say-as interpret-as='interjection'>aiyo!</say-as> " + guessNum.toString() + 
                ' is wrong. <s>The square of ' + this.attributes['number'] + ' is ' + this.attributes['answer'] + '. </s>'
            this.emitWithState('QuestionIntent')
            console.log("Here")
        }
    },

    'AMAZON.HelpIntent': function () {
        this.response.speak('I am thinking of a number between zero and one hundred, try to guess and I will tell you' +
            ' if it is higher or lower.')
            .listen('Try saying a number.');
        this.emit(':responseReady');
    },

    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB
    },

    'Unhandled': function () {
        this.response.speak('Sorry, I didn\'t get that. Try saying a number.')
            .listen('Try saying a number.');
        this.emit(':responseReady');
    }
});

module.exports = guessModeHandlers;