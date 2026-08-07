const fs = require('fs-extra');
const path = require('path');
const child_process = require('child_process');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { promisify } = require('util');

const exec = promisify(child_process.exec);

const config = require('./config');

/**
 * Starts the Express server that receives notifications
 * @param {function(import('./config').PydtNotification): Promise<void>} callback - Callback to handle incoming notifications
 * @returns {Promise<void>}
 */
async function startExpressServer(callback) {
    if (typeof callback !== 'function')
        throw new Error('Callback is not a function');

    /** @type {import('express').Application} */
    const app = express();
    app.use(morgan('combined'));

    app.get('/', (req, res) => res.send('Up and running!'));

    app.post('/', bodyParser.json({type: '*/*'}), (req, res) => {
        console.log({ type: 'requestMatched', headers: req.headers, body: req.body });
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
        // @ts-expect-error - fs-extra exists returns Promise<boolean> in current version
        if (await fs.exists(socket)) {
            await fs.unlink(socket);
        }
    }

    // @ts-expect-error - app.listen accepts (port|socket, callback?)
    await promisify(app.listen).call(app, config.http.socket || config.http.port);

    if (socket) {
        await exec(`chgrp www-data '${socket}'`);
        await exec(`chmod 770 '${socket}'`);
    }

    console.log(`Listening on ${socket || config.http.port}`);
}

module.exports = { startExpressServer };
