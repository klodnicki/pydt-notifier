const util = require('util');
const Discord = require('discord.io');
const config = require('./config');
const { mod } = require('./utils');
const { MessageGenerator } = require('./messageGenerator');

class DiscordBot extends Discord.Client {
    constructor(opts) {
        super({
            token: config.discord.clientToken,
            ...(opts || {}),
            autorun: false
        });
        this.messageGenerator = new MessageGenerator();
    }

    connect() {
        if (this.connected) return Promise.resolve(this);

        console.log(`Logging into Discord...`);

        return new Promise((resolve, reject) => {
            const rejectCallback = (errMsg, code) => {
                reject({errMsg, code});
            };
            this.once('disconnect', rejectCallback);

            this.once('ready', () => {
                this.removeListener('disconnect', rejectCallback);
                resolve(this);
            });

            this.once('error', reject);

            super.connect();
        }).then(() => {
            console.log(`Logged into Discord as ${this.username} - ${this.id}.`);

            this.on('disconnect', (errMsg, code) => {
                console.log(`Discord disconnected with code ${code}: ${errMsg}`);
            });

            return this;
        });
    }

    sendMessage(options) {
        return util.promisify(super.sendMessage).call(this, options);
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

        await this.connect();
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

module.exports = { DiscordBot };
