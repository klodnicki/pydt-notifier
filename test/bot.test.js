import { expect } from 'chai';
import { Bot } from '../bot.js';

let sent = null;
let loginCalled = false;

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

describe('Bot.notify', () => {
  beforeEach(() => { sent = null; loginCalled = false; });

  it('returns early for unknown game', async () => {
    const FakeDiscordInterface = function() {
      this.login = async () => { loginCalled = true; return this; };
      this.sendToChannel = async (channel, text) => { sent = text; };
    };
    const bot = new Bot(fakeConfig, new FakeDiscordInterface(), new FakeMessageGenerator());
    await bot.notify({ gameName: 'Nope', userName: 'Alice' });
    expect(sent).to.be.null;
    expect(loginCalled).to.be.false;
  });

  it('sends a message for known game/player', async () => {
    const FakeDiscordInterface = function() {
      this.login = async () => { loginCalled = true; return this; };
      this.sendToChannel = async (channel, text) => { sent = text; };
    };
    const bot = new Bot(fakeConfig, new FakeDiscordInterface(), new FakeMessageGenerator());
    await bot.notify({ gameName: 'TestGame', userName: 'Bob' });
    expect(loginCalled).to.be.true;
    expect(sent).to.equal(fakeMessage);
  });

  it('returns early for unknown player', async () => {
    const FakeDiscordInterface = function() {
      this.login = async () => { loginCalled = true; return this; };
      this.sendToChannel = async (channel, text) => { sent = text; };
    };
    const bot = new Bot(fakeConfig, new FakeDiscordInterface(), new FakeMessageGenerator());
    await bot.notify({ gameName: 'TestGame', userName: 'Charlie' });
    expect(sent).to.be.null;
    expect(loginCalled).to.be.false;
  });

  it('passes correct prev and next players to messageGenerator', async () => {
    let received = null;
    const FakeDiscordInterface = function() {
      this.login = async () => { loginCalled = true; return this; };
      this.sendToChannel = async (channel, text) => { sent = text; };
    };
    const FakeMessageGenerator2 = function() {
      this.generateMessage = (prev, next, gameName, game) => {
        received = { prev, next, gameName, game };
        return 'msg';
      };
    };
    const bot = new Bot(fakeConfig, new FakeDiscordInterface(), new FakeMessageGenerator2());
    await bot.notify({ gameName: 'TestGame', userName: 'Alice' });
    expect(loginCalled).to.be.true;
    expect(received.next.pydtName).to.equal('Alice');
    expect(received.prev.pydtName).to.equal('Bob');
  });

  it('propagates sendToChannel errors', async () => {
    const FakeDiscordInterface2 = function() {
      this.login = async () => { loginCalled = true; return this; };
      this.sendToChannel = async (channel, text) => { throw new Error('boom'); };
    };
    const bot = new Bot(fakeConfig, new FakeDiscordInterface2(), new FakeMessageGenerator());
    try {
      await bot.notify({ gameName: 'TestGame', userName: 'Bob' });
      throw new Error('Did not throw');
    } catch (e) {
      expect(e.message).to.equal('boom');
    }
  });
});
