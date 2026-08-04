const { expect } = require('chai');
const proxyquire = require('proxyquire');

const fakeConfig = {
  message: 'Hello {{discordTag nextPlayer}} from {{source messageData.greeting}}',
  messageData: { greeting: 'world' }
};

const MessageGenerator = proxyquire('../messageGenerator', {
  './config': fakeConfig
}).MessageGenerator;

describe('MessageGenerator', () => {
  it('generates a message using helpers', () => {
    const mg = new MessageGenerator();
    const prev = { pydtName: 'Alice', discordId: '1' };
    const next = { pydtName: 'Bob', discordId: '2' };

    const out = mg.generateMessage(prev, next, 'Game', { players: [prev, next] });
    expect(out).to.include('<@2>');
    expect(out).to.include('world');
  });

  it('randomMessageIn helper rejects non-array input', () => {
    const mg = new MessageGenerator();
    const template = mg.handlebars.compile('{{randomMessageIn notAnArray}}');
    const out = template({ notAnArray: 'nope' });
    expect(out).to.include('Input is not an array');
  });
});
