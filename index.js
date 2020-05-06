#!/usr/bin/env node

const { DiscordBot } = require('./discordBot');
const { startExpressServer } = require('./express');

const config = require('./config');

(async () => {

    const bot = await new DiscordBot().connect();

    if (config.testNotification) await bot.notify(config.testNotification);

    await startExpressServer(bot);

})().catch(err => {
    console.error(err);
    process.exit(1);
});
