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

        // The `Discord.Client` constructor assigns a bound `connect()` as a
        // property on the instance, it is not directly inherited from
        // `Discord.Client.prototype`.  Therefore it cannot be extended
        // normally with `super.connect()`.  Work around that by reassigning
        // to another name.
        Object.defineProperty(this, '_superConnect',
                Object.getOwnPropertyDescriptor(this, 'connect'));
        this.connect = this._connect;
    }

    // This must be named differently so the `Discord.Client` constructor
    // finds the original function
    async _connect() {
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

            this._superConnect();
        });

        console.log(`Logged into Discord as ${this.username} - ${this.id}.`);

        this.on('disconnect', (errMsg, code) => {
            console.log(`Discord disconnected with code ${code}: ${errMsg}`);
        });

        return this;
    }

    sendMessage(options) {
        return util.promisify(super.sendMessage).call(this, options);
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

module.exports = { DiscordBot };
