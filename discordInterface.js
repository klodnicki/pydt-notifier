const config = require('./config');
const Discord = require('discord.js');

class DiscordInterface {
    constructor() {
        this.connecting = false;

        this.client = new Discord.Client({ intents: [] });

        this.client.on('error', console.error);
        this.client.on('warn',  console.warn);

        this.login();
    }

    async login() {
        if (this.client.isReady())  return this;
        if (this.connecting)        return this.loginPromise.then(() => this);
        this.connecting = true;

        console.log('Logging into Discord...');

        // client.login() is already an async function, but it resolves
        // slightly before the 'ready' event.  So in order to reliably use
        // client.isReady() to determine whether we've connected, we must
        // maintain the "connecting" state beyond the resolution of
        // client.login().
        this.loginPromise = new Promise((resolve, reject) => {
            this.client.once('ready', resolve);
            this.client.login(config.discord.clientToken)
                .catch(reject);
        });

        await this.loginPromise
            .catch(err => {
                console.error('Failed to connect to Discord');
                throw err;
            })
            .finally(() => { this.connecting = false; });

        console.log(`Logged into Discord as ${this.client.user.username}`);

        return this;
    }

    async getChannel(id) {
        await this.login();
        const channel = await this.client.channels.fetch(id);
        if (!channel.isText()) {
            throw new Error('Channel is not text!');
        }
        return channel;
    }

    async sendToChannel(channel, text) {
        await this.login();
        await (await this.getChannel(channel)).send(text);
    }
}

module.exports = { DiscordInterface };
