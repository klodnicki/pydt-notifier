const fs = require('fs-extra');
const path = require('path');
const child_process = require('child_process');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { promisify } = require('util');

const exec = promisify(child_process.exec);

const config = require('./config');

async function startExpressServer(callback) {
    if (typeof callback !== 'function')
        throw new Error('Callback is not a function');

    const app = express();
    app.use(morgan('combined'));

    app.get('/', (req, res) => res.send('Up and running!'));

    app.post('/', bodyParser.json({type: '*/*'}), (req, res) => {
        Promise.resolve(callback(req.body))
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

    await promisify(app.listen)
            .call(app, config.http.socket || config.http.port);

    if (socket) {
        await exec(`chgrp www-data '${socket}'`);
        await exec(`chmod 770 '${socket}'`);
    }

    console.log(`Listening on ${socket || config.http.port}`);
}

module.exports = { startExpressServer };
