const Handlebars = require('handlebars');
const config = require('./config');

const compileOptions = {
    noEscape: true
};

class MessageGenerator {
    constructor() {
        const self = this;

        this.handlebars = Handlebars.create();

        this.handlebars.registerHelper('source', function(str, options) {
            if (typeof str !== 'string') {
                return "(Not given a string!)";
            }
            return self.handlebars.compile(str, compileOptions)(options.data.root);
        });

        this.handlebars.registerHelper('discordTag', function(player, options) {
            console.dir(player);
            return new Handlebars.SafeString(`<@${player.discordId}>`);
        });

        this.handlebars.registerHelper('randomMessageIn', function(randomFrom, options) {
            if (!(randomFrom instanceof Array)) {
                return "(Input is not an array!)";
            }
            const choice = randomFrom[Math.floor(Math.random()*randomFrom.length)];
            if (typeof choice !== 'string') {
                return "(Random choice was not a string!)";
            }
            return self.handlebars.compile(choice, compileOptions)(options.data.root);
        });

        this.base = this.handlebars.compile(config.message, compileOptions);
    }

    generateMessage(prevPlayer, nextPlayer, gameName, game) {
        return this.base({
            ...config.messageData,
            prevPlayer,
            nextPlayer,
            gameName,
            game
        });
    }
}

module.exports = { MessageGenerator };