#!/usr/bin/env node

const { Bot } = require('./bot');
const { startExpressServer } = require('./express');

const config = require('./config');

(async () => {

    const bot = new Bot();

    if (config.testNotification) await bot.notify(config.testNotification);

    await startExpressServer(bot.notify.bind(bot));

})().catch(err => {
    console.error(err);
    process.exit(1);
});
