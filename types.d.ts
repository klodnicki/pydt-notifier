// Type definitions for JS modules
// @ts-check

// Declare global types that can be used in JSDoc annotations
declare global {
    interface DiscordInterfaceType {
        connecting: boolean;
        client: import('discord.js').Client;
        loginPromise: Promise<void> | undefined;
        login(): Promise<DiscordInterfaceType>;
        getChannel(id: string): Promise<import('discord.js').TextChannel>;
        sendToChannel(channel: string, text: string): Promise<void>;
    }

    interface MessageGeneratorType {
        handlebars: typeof import('handlebars');
        base: HandlebarsTemplateDelegate;
        generateMessage(prevPlayer: import('./config').Player, nextPlayer: import('./config').Player, gameName: string, game: import('./config').GameEntry): string;
    }

    interface BotType {
        discordInterface: DiscordInterfaceType;
        messageGenerator: MessageGeneratorType;
        notify(pydtNotification: import('./config').PydtNotification): Promise<void>;
    }
}

export {}; // Make this file a module
