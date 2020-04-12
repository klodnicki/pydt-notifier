const Discord = require('discord.io');
const express = require('express');
const bodyParser = require('body-parser');

const thanksMessages = [
	  ['Thanks for doing your turn, ', '!'],
	  ['Thanks, ', ',  for doing your turn!'],
	  ['Good job, ', '!'],
	  ['Done and done by ', '.'],
	  ['An excellent turn completion by ', '.'],
	  ['WHAT A MOVE! ', ' is really shaking up the world.'],
	  ['Power play by ', '!'],
	  ['', ', I did *not* see that coming!'],
	  ['*Smashing* maneuver by ', '!'],
	  ['Interesting move, ', '.']
];

const promptMessages = [
	  ['Let\'s see how ', ' responds.'],
	  ['', ' is up now - let\'s see what happens.'],
	  ['How will you respond, ', '?'],
	  ['How will ', ' respond?'],
	  ['You\'re up, ', '!'],
	  ['', ' is up next!'],
	  ['Time for ', ' to go!'],
	  ['Don\'t be slow, ', '!'],
	  ['', ' is up!'],
];

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
const pydtChannel = '698727225171902464';

// Setup Discord

const bot = new Discord.Client({
	token: '[REDACTED]',
	autorun: true
});

bot.on('ready', function() {
	console.log(`Logged in as ${bot.username} - ${bot.id}`);
});

bot.on('disconnect', function(e, code) {
	console.log('Discord error:');
	console.error(e);
	console.error(code);
});

// Setup Express

const app = express();

app.post('/', bodyParser.json({type: '*/*'}), (req, res) => {
	res.send();

	const nextPlayer = people.find(p => p.pydtName === req.body.userName);
	const prevPlayer = nextPlayer.prevPlayer();

	const thanksMessageArr = thanksMessages[Math.floor(Math.random()*thanksMessages.length)];
	const thanksMessage = `${thanksMessageArr[0]}${prevPlayer.friendlyName}${thanksMessageArr[1]}`;

	const promptMessageArr = promptMessages[Math.floor(Math.random()*promptMessages.length)];
	const promptMessage = `${promptMessageArr[0]}<@${nextPlayer.discordId}>${promptMessageArr[1]}`;

	const message = `${thanksMessage} ${promptMessage}`;


	bot.sendMessage({
		to: pydtChannel,
		message: message
	}, (err, response) => console.dir({err, response}));
});

app.listen(7532, (err) => {
	if(err) console.error(err);
	else console.log('Listening on 7532');
});

