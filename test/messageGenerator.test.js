const { expect } = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

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

  it('source helper rejects non-string input', () => {
    const mg = new MessageGenerator();
    const template = mg.handlebars.compile('{{source notAString}}');
    const out = template({ notAString: 5 });
    expect(out).to.include('Not given a string');
  });

  it('discordTag helper renders a mention', () => {
    const mg = new MessageGenerator();
    const template = mg.handlebars.compile('{{discordTag player}}');
    const out = template({ player: { discordId: '42' }});
    expect(out).to.include('<@42>');
  });

  it('randomMessageIn selects and compiles a choice', () => {
    const mg = new MessageGenerator();
    const choices = ['Hello {{messageData.greeting}}', 'Bye'];
    const template = mg.handlebars.compile('{{randomMessageIn choices}}');

    sinon.stub(Math, 'random').returns(0); // pick first element
    const out = template({ choices, messageData: { greeting: 'there' }});
    expect(out).to.equal('Hello there');
    Math.random.restore();
  });

  it('randomMessageIn warns when choice is not a string', () => {
    const mg = new MessageGenerator();
    const choices = ['ok', 5];
    const template = mg.handlebars.compile('{{randomMessageIn choices}}');
    sinon.stub(Math, 'random').returns(0.9);
    const out = template({ choices });
    expect(out).to.include('Random choice was not a string');
    Math.random.restore();
  });
});
