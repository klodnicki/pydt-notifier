const fs = require('fs-extra');
const path = require('path');
const child_process = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./config');

async function startExpressServer(bot) {
	const app = express();

	app.get('/', (req, res) => res.send('Up and running!'));

	app.post('/', bodyParser.json({type: '*/*'}), (req, res) => {
		bot.notify(req.body)
			.then(() => res.send())
			.catch(e => {
				console.error(e);
				res.status(500).json(e);
			});
	});

	const socket = config.http.socket
	  ? path.resolve(config.http.socket)
	  : null;

	if (socket) {
		if (await fs.exists(socket)) {
			await fs.unlink(socket);
		}
	}

	await new Promise((resolve, reject) => {
		app.listen(config.http.socket || config.http.port, err => {
			if (err) reject(err);
			else resolve();
		});
	});

	if (socket) {
		await new Promise((resolve, reject) => {
			child_process.exec(`chgrp www-data '${socket}'`, err => {
				if (err) reject(err);
				else resolve();
			});
		});
		await new Promise((resolve, reject) => {
			child_process.exec(`chmod 770 '${socket}'`, err => {
				if (err) reject(err);
				else resolve();
			});
		});
	}

	console.log(`Listening on ${socket || config.http.port}`);
}

module.exports = { startExpressServer };