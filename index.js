#!/usr/bin/env node

import { resolve } from 'path';
import { Bot } from './bot.js';
import { startExpressServer } from './express.js';

const configPath = process.env.PYDT_NOTIFIER_CONFIG || process.argv[2] || './config.json';
const { default: config } = await import(resolve(configPath));

const bot = new Bot(config);

if (config.testNotification) await bot.notify(config.testNotification);

await startExpressServer(config, bot.notify.bind(bot));
