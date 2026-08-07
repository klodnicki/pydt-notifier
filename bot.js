import { mod } from './utils.js';
import { MessageGenerator } from './messageGenerator.js';
import { DiscordInterface } from './discordInterface.js';

export class Bot {
    constructor(config, discordInterface, messageGenerator) {
        this.config = config;
        this.discordInterface = discordInterface || new DiscordInterface(config);
        this.messageGenerator = messageGenerator || new MessageGenerator(config);
    }

    async notify(pydtNotification) {
        const [gameName, gameEntry] = Object.entries(this.config.games).find(([name, obj]) => name === '*' || name === pydtNotification.gameName) || [];
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
