const util = require('util');
const Discord = require('discord.io');
const config = require('./config');
const { mod } = require('./utils');
const { MessageGenerator } = require('./messageGenerator');

class DiscordBot extends Discord.Client {
    constructor(opts = {}) {
        super({
            token: config.discord.clientToken,
            ...opts
        });
        this.messageGenerator = new MessageGenerator();
    }

    async connect(...args) {
        if (this.connected) return this;

        console.log(`Logging into Discord...`);

        await new Promise((resolve, reject) => {
            const rejectCallback = (errMsg, errCode) => {
                const err = new Error('Failed to connect to Discord');
                reject(Object.assign(err, {errMsg, errCode}));
            };
            this.once('disconnect', rejectCallback);

            this.once('ready', () => {
                this.removeListener('disconnect', rejectCallback);
                resolve();
            });

            this.once('error', reject);

            super.connect(...args);
        });

        console.log(`Logged into Discord as ${this.username} - ${this.id}.`);

        this.on('disconnect', (errMsg, code) => {
            console.log(`Discord disconnected with code ${code}: ${errMsg}`);
        });

        return this;
    }

    async notify(pydtNotification) {
        const connected = this.connect();

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

        await connected;
        process.stdout.write(`${gameName}: Sending ${JSON.stringify(message)}... `);
        try {
            await this.sendMessage({ to: gameEntry.discord.targetChannel, message });
        } catch(e) {
            process.stdout.write('\n');
            throw e;
        }
        process.stdout.write('done.\n');
    }
}

// As of now (May 2020), there's no way to add a prototype method by
// assignment from within the class body.  So we'll do it the old-school way.
DiscordBot.prototype.sendMessage =
        util.promisify(Discord.Client.prototype.sendMessage);

module.exports = { DiscordBot };
