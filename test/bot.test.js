const { expect } = require('chai');
const proxyquire = require('proxyquire');

let sent = null;
let loginCalled = false;

const FakeDiscordInterface = function() {
  this.login = async () => { loginCalled = true; return this; };
  this.getChannel = async (id) => ({ isText: () => true, send: async (t) => { sent = t; } });
  this.sendToChannel = async (channel, text) => { sent = text; };
};

const fakeMessage = 'A generated message';
const FakeMessageGenerator = function() { this.generateMessage = () => fakeMessage; };

const fakeConfig = {
  games: {
    'TestGame': {
      players: [ { pydtName: 'Alice', discordId: '1' }, { pydtName: 'Bob', discordId: '2' } ],
      discord: { targetChannel: '123' }
    }
  }
};

const { Bot } = proxyquire('../bot', {
  './discordInterface': { DiscordInterface: FakeDiscordInterface },
  './messageGenerator': { MessageGenerator: FakeMessageGenerator },
  './config': fakeConfig
});

describe('Bot.notify', () => {
  beforeEach(() => { sent = null; loginCalled = false; });

  it('returns early for unknown game', async () => {
    const bot = new Bot();
    await bot.notify({ gameName: 'Nope', userName: 'Alice' });
    expect(sent).to.be.null;
    expect(loginCalled).to.be.false;
  });

  it('sends a message for known game/player', async () => {
    const bot = new Bot();
    await bot.notify({ gameName: 'TestGame', userName: 'Bob' });
    expect(loginCalled).to.be.true;
    expect(sent).to.equal(fakeMessage);
  });
});
