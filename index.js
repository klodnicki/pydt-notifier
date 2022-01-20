#!/usr/bin/env node

const { DiscordBot } = require('./discordBot');
const { startExpressServer } = require('./express');

const config = require('./config');

(async () => {

    const bot = new DiscordBot();
    await bot.ensureConnected();

    if (config.testNotification) await bot.notify(config.testNotification);

    await startExpressServer(bot.notify.bind(bot));

})().catch(err => {
    console.error(err);
    process.exit(1);
});
