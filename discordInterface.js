const config = require('./config');
const Discord = require('discord.js');

/**
 * Interface for interacting with Discord
 */
class DiscordInterface {
    /**
     * Creates a new DiscordInterface instance
     */
    constructor() {
        /** @type {boolean} */
        this.connecting = false;

        /** @type {Discord.Client} */
        this.client = new Discord.Client({ intents: [] });

        /** @type {Promise<void>|undefined} */
        this.loginPromise = undefined;

        this.client.on('error', console.error);
        this.client.on('warn',  console.warn);

        this.login()
            .catch(err => {
                console.error(err);
                process.exit(1);
            });
    }

    /**
     * Logs into Discord
     * @returns {Promise<this>}
     */
    async login() {
        if (this.client.isReady())  return this;
        if (this.connecting)        return /** @type {Promise<void>} */ (this.loginPromise).then(() => this);
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
        })
        .then(() => {
            // @ts-expect-error - client.user is guaranteed to be defined after 'ready' event
            console.log(`Logged into Discord as ${this.client.user.username}`);
        }, err => {
            console.error('Failed to connect to Discord');
            throw err;
        });

        await this.loginPromise
            .finally(() => { this.connecting = false; });

        return this;
    }

    /**
     * Gets a text channel by ID
     * @param {string} id - The channel ID
     * @returns {Promise<Discord.TextChannel>}
     */
    async getChannel(id) {
        await this.login();
        const channel = await this.client.channels.fetch(id);
        if (!channel || !channel.isSendable()) {
            throw new Error('Channel is not text!');
        }
        // @ts-expect-error - isSendable() check ensures this is a text channel
        return channel;
    }

    /**
     * Sends a message to a Discord channel
     * @param {string} channel - The channel ID
     * @param {string} text - The message to send
     * @returns {Promise<void>}
     */
    async sendToChannel(channel, text) {
        await this.login();
        await (await this.getChannel(channel)).send(text);
    }
}

module.exports = { DiscordInterface };
