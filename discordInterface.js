import Discord from 'discord.js';

export class DiscordInterface {
    constructor(config) {
        this.config = config;
        this.connecting = false;

        this.client = new Discord.Client({ intents: [] });

        this.client.on('error', console.error);
        this.client.on('warn',  console.warn);
    }

    async login() {
        if (this.client.isReady())  return this;
        if (this.connecting)        return this.loginPromise.then(() => this);
        this.connecting = true;

        console.log('Logging into Discord...');

        this.loginPromise = new Promise((resolve, reject) => {
            this.client.once('ready', resolve);
            this.client.login(this.config.discord.clientToken)
                .catch(reject);
        })
        .then(() => {
            console.log(`Logged into Discord as ${this.client.user.username}`);
        }, err => {
            console.error('Failed to connect to Discord');
            throw err;
        });

        await this.loginPromise
            .finally(() => { this.connecting = false; });

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
