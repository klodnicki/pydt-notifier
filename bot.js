const util = require('util');
const config = require('./config');
const { mod } = require('./utils');
const { MessageGenerator } = require('./messageGenerator');
const { DiscordInterface } = require('./discordInterface');

/**
 * Bot class that handles sending turn notifications to Discord
 */
class Bot {
    /**
     * Creates a new Bot instance
     */
    constructor() {
        /** @type {import('./discordInterface').DiscordInterface} */
        this.discordInterface = new DiscordInterface();
        /** @type {import('./messageGenerator').MessageGenerator} */
        this.messageGenerator = new MessageGenerator();
    }

    /**
     * Sends a notification to Discord for a PYDT turn notification
     * @param {import('./config').PydtNotification} pydtNotification - The notification data from PYDT
     * @returns {Promise<void>}
     */
    async notify(pydtNotification) {
        const [gameName, gameEntry] = Object.entries(config.games).find(([name, obj]) => name === '*' || name === pydtNotification.gameName) || [];
        if (gameEntry === undefined) {
            console.log('Unrecognized game: ' + pydtNotification.gameName);
            return;
        }

        const nextPlayerI = gameEntry.players.findIndex(p => p.pydtName === pydtNotification.userName);
        if (nextPlayerI === -1) {
            console.log('Unrecognized player: ' + pydtNotification.userName + ' in game ' + gameName);
            return;
        }

        const nextPlayer = gameEntry.players[nextPlayerI];
        const prevPlayer = gameEntry.players[mod(nextPlayerI - 1, gameEntry.players.length)];

        // @ts-expect-error - gameName is a string | undefined but we only reach here when gameEntry is defined
        const message = this.messageGenerator.generateMessage(prevPlayer, nextPlayer, gameName, gameEntry);

        await this.discordInterface.login();

        process.stdout.write(`${gameName}: Sending ${JSON.stringify(message)}... `);
        try {
            await this.discordInterface.sendToChannel(gameEntry.discord.targetChannel, message);
        } catch(e) {
            process.stdout.write('\n');
            throw e;
        }
        process.stdout.write('done.\n');
    }
}

module.exports = { Bot };
