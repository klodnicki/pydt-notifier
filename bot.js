const util = require('util');
const Backoff = require('backo');
const config = require('./config');
const { mod } = require('./utils');
const { MessageGenerator } = require('./messageGenerator');
const { DiscordInterface } = require('./discordInterface');

class Bot {
    constructor() {
        this.discordInterface = new DiscordInterface();
        this.messageGenerator = new MessageGenerator();
    }

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

        const message = this.messageGenerator.generateMessage(prevPlayer, nextPlayer, gameName, gameEntry);

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
