#!/usr/bin/env node

const Discord = require('discord.io');
const express = require('express');
const bodyParser = require('body-parser');

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

const zack = people.find(p => p.friendlyName === 'Zack').discordId;

function exitError (err) {
	console.error(err);
	process.exit(1);
}

// Setup Discord

const bot = new Discord.Client({ token: config.discord.clientToken });

const botReady = new Promise((resolve, reject) => {
	bot.on('ready',      resolve);
	bot.on('disconnect', (errMsg, code) => reject({errMsg, code}));
	bot.connect();
}).catch((err) => {
	console.error('Failed to connect bot to Discord');
	exitError(err);
});

botReady.then((event) => {
	console.log(`Logged in as ${bot.username} - ${bot.id}`);

	bot.on('disconnect', function(e, code) {
		console.log('Discord error:');
		console.error(e);
		console.error(code);
		process.exit(1);
	});
}).catch(exitError);

// Setup Express

const app = express();

app.post('/', bodyParser.json({type: '*/*'}), (req, res) => {
	res.send();

	botReady.then((event) => {
		const nextPlayer = people.find(p => p.pydtName === req.body.userName);
		const prevPlayer = nextPlayer.prevPlayer();

		const thanksMessage = thanksMessages.random()(prevPlayer.friendlyName);
		const promptMessage = promptMessages.random()(`<@${nextPlayer.discordId}>`);

		const message = `${thanksMessage} ${promptMessage}`;


		bot.sendMessage({
			to: config.discord.targetChannel,
			message: message
		}, (err, response) => {
			if (err) console.error(err);
			else     console.dir(response);
		});
	}).catch(console.error);
});

app.listen(config.http.port, (err) => {
	if (err) exitError(err);
	else console.log(`Listening on ${config.http.port}`);
});

