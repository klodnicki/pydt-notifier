const util = require('util');
const { Client, Intents } = require('discord.js');
const Backoff = require('backo');
const config = require('./config');
const { mod } = require('./utils');
const { MessageGenerator } = require('./messageGenerator');

class DiscordBot {
    constructor(opts = {}) {
        this.client = new Client({
            intents: Intents.FLAGS.GUILDS,
            ...opts
        });
        this.client.token = config.discord.clientToken;

        this.client.on('error', console.error);
        this.client.on('warn',  console.warn);

        this.messageGenerator = new MessageGenerator();
    }

    async ensureConnected(...args) {
        if (this.client.isReady()) return;
        
        this.connectingPromise = this.connectingPromise || (async () => {

            const backoff = new Backoff({ min: 50, max: 60000 });
            while(!this.client.isReady()) {
                try {
                    await this.connect(...args);
                } catch(e) {
                    console.error(e);
                    await new Promise(r => setTimeout(r, backoff.duration()));
                }
            }
            
            this.connectingPromise = null;
        })();

        return await this.connectingPromise;
    }

    async connect(...args) {
        if (this.client.isReady()) return this;

        console.log(`Logging into Discord...`);

        await this.client.login(...args)
            .catch(err => {
                console.error('Failed to connect to Discord');
                throw err;
            });

        console.log(`Logged into Discord as ${this.client.user.username} - ${this.client.user.id}.`);

        return this;
    }

    async notify(pydtNotification) {
        const connected = this.ensureConnected();

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
        const channel = await this.client.channels.fetch(gameEntry.discord.targetChannel);

        process.stdout.write(`${gameName}: Sending ${JSON.stringify(message)}... `);
        try {
            await channel.send(message);
        } catch(e) {
            process.stdout.write('\n');
            throw e;
        }
        process.stdout.write('done.\n');
    }
}

module.exports = { DiscordBot };
