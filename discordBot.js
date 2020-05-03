const util = require('util');
const Discord = require('discord.io');
const config = require('./config');
const { mod } = require('./utils');

class ExtArray extends Array {
	random () {
		// Use `Object.keys()` to work w/ sparse arrays
		const keys = Object.keys(this);
		return this[keys[Math.floor(Math.random()*keys.length)]];
	}
}

const thanksMessages = new ExtArray(
	(name) => `Thanks for doing your turn, ${name}!`,
	(name) => `Thanks, ${name}, for doing your turn!`,
	(name) => `Good job, ${name}!`,
	(name) => `Done and done by ${name}.`,
	(name) => `An excellent turn completion by ${name}.`,
	(name) => `WHAT A MOVE! ${name} is really shaking up the world.`,
	(name) => `Power play by ${name}!`,
	(name) => `${name}, I did *not* see that coming!`,
	(name) => `*Smashing* maneuver by ${name}!`,
	(name) => `Interesting move, ${name}.`
);

const promptMessages = new ExtArray(
	(name) => `Let's see how ${name} responds.`,
	(name) => `${name} is up now - let's see what happens.`,
	(name) => `How will you respond, ${name}?`,
	(name) => `How will ${name} respond?`,
	(name) => `You're up, ${name}!`,
	(name) => `${name} is up next!`,
	(name) => `Time for ${name} to go!`,
	(name) => `Don't be slow, ${name}!`,
	(name) => `${name} is up!`,
);

class DiscordBot extends Discord.Client {
    constructor(opts) {
        super({
            token: config.discord.clientToken,
            ...(opts || {}),
            autorun: false
        });
    }

    waitForConnection() {
		if (this.connected) return;

        return new Promise((resolve, reject) => {
            console.log(`Logging into Discord...`);

			const rejectCallback = (errMsg, code) => {
                reject({errMsg, code});
            };
            this.once('disconnect', rejectCallback);

            this.once('ready', () => {
				this.removeListener('disconnect', rejectCallback);
                console.log(`Logged into Discord as ${this.username} - ${this.id}.`);

                this.on('disconnect', (errMsg, code) => {
                    console.log(`Discord disconnected with code ${code}: ${errMsg}`);
                });

                resolve(this);
            });

            this.once('error', reject);

            this.connect();
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

		const thanksMessage = thanksMessages.random()(prevPlayer.friendlyName);
		const promptMessage = promptMessages.random()(`<@${nextPlayer.discordId}>`);

		const message = `${thanksMessage} ${promptMessage}`;

		await this.waitForConnection();
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
