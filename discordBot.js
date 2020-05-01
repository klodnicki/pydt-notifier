const util = require('util');
const Discord = require('discord.io');
const config = require('./config');

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

const people = [
	{
		pydtName: 'klod.zack',
		friendlyName: 'Zack',
		discordId: '303699009401389057',
		prevPlayer: () => people[2]
	}, {
		pydtName: 'johnnyklod',
		friendlyName: 'John',
		discordId: '303678504690515969',
		prevPlayer: () => people[0]
	}, {
		pydtName: 'ZER0',
		friendlyName: 'Josh',
		discordId: '303669109902802945',
		prevPlayer: () => people[1]
	}
];


class DiscordBot extends Discord.Client {
    constructor(opts) {
        super({
            token: config.discord.clientToken,
            ...(opts || {}),
            autorun: false
        });
    }

    waitForConnection() {
        return new Promise((resolve, reject) => {
            console.log(`Logging into Discord...`);

            this.once('disconnect', (errMsg, code) => {
                console.log('hey');
                reject({errMsg, code});
            });

            this.once('ready', () => {
                console.log(`Logged into Discord as ${this.username} - ${this.id}.`);

                this.on('disconnect', (errMsg, code) => {
                    throw new Error(`Discord disconnected with code ${code}: ${errMsg}`);
                });

                resolve(this);
            });

            this.once('error', reject);

            this.connect();
        });
    }

    sendMessage(options) {
		return util.promisify(super.sendMessage).call(this, {
			to: config.discord.targetChannel,
			...options
		});
    }

    async notify(pydtNotification) {
		const nextPlayer = people.find(p => p.pydtName === pydtNotification.userName);
		const prevPlayer = nextPlayer.prevPlayer();

		const thanksMessage = thanksMessages.random()(prevPlayer.friendlyName);
		const promptMessage = promptMessages.random()(`<@${nextPlayer.discordId}>`);

		const message = `${thanksMessage} ${promptMessage}`;

		await this.sendMessage({ message });
    }
}

module.exports = { DiscordBot };
