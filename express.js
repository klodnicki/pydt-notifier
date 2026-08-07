import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { promisify } from 'util';

export async function startExpressServer(config, callback) {
    if (typeof callback !== 'function')
        throw new Error('Callback is not a function');

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
