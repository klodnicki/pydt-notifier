const Handlebars = require('handlebars');
const config = require('./config');

const compileOptions = {
    noEscape: true
};

/**
 * Generates formatted messages for Discord notifications
 */
class MessageGenerator {
    /**
     * Creates a new MessageGenerator instance
     */
    constructor() {
        /** @type {MessageGenerator} */
        const self = this;

        /** @type {typeof Handlebars} */
        this.handlebars = Handlebars.create();

        this.handlebars.registerHelper('source', function(/** @type {unknown} */ str, /** @type {Handlebars.HelperOptions} */ options) {
            if (typeof str !== 'string') {
                return "(Not given a string!)";
            }
            return self.handlebars.compile(str, compileOptions)(options.data.root);
        });

        this.handlebars.registerHelper('discordTag', function(/** @type {unknown} */ player, /** @type {Handlebars.HelperOptions} */ options) {
            return new Handlebars.SafeString(`<@${/** @type {{discordId: string}} */(player).discordId}>`);
        });

        this.handlebars.registerHelper('randomMessageIn', function(/** @type {unknown} */ randomFrom, /** @type {Handlebars.HelperOptions} */ options) {
            if (!(randomFrom instanceof Array)) {
                return "(Input is not an array!)";
            }
            const choice = randomFrom[Math.floor(Math.random()*randomFrom.length)];
            if (typeof choice !== 'string') {
                return "(Random choice was not a string!)";
            }
            return self.handlebars.compile(choice, compileOptions)(options.data.root);
        });

        /** @type {HandlebarsTemplateDelegate} */
        this.base = this.handlebars.compile(config.message, compileOptions);
    }

    /**
     * Generates a message based on player and game information
     * @param {import('./config').Player} prevPlayer - The player who just finished their turn
     * @param {import('./config').Player} nextPlayer - The player who is up next
     * @param {string} gameName - The name of the game
     * @param {import('./config').GameEntry} game - The game configuration
     * @returns {string} The formatted message
     */
    generateMessage(prevPlayer, nextPlayer, gameName, game) {
        return this.base({
            messageData: config.messageData,
            prevPlayer,
            nextPlayer,
            gameName,
            game
        });
    }
}

module.exports = { MessageGenerator };
