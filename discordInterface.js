const config = require('./config');
const Discord = require('discord.js');

class DiscordInterface {
    constructor() {
        this.client = new Discord.Client({ intents: [] });

        this.client.on('error', console.error);
        this.client.on('warn',  console.warn);

        this.loginPromise = (async () => {
            console.log('Logging into Discord...');
            await this.client.login(config.discord.clientToken)
                .catch(err => {
                    console.error('Failed to connect to Discord');
                    throw err;
                });
            console.log(`Logged into Discord as ${this.client.user.username}`);
        })();
    }

    async getChannel(id) {
        await this.loginPromise;
        const channel = await this.client.channels.fetch(id);
        if (!channel.isText()) {
            throw new Error('Channel is not text!');
        }
        return channel;
    }

    async sendToChannel(channel, text) {
        await (await this.getChannel(channel)).send(text);
    }
}

module.exports = { DiscordInterface };
