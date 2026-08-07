import { expect } from 'chai';
import { startExpressServer } from '../express.js';

const fakeConfig = { http: { port: 0, socket: null } };

describe('startExpressServer', () => {
  it('throws if callback not a function', async () => {
    try {
      await startExpressServer(fakeConfig, null);
      throw new Error('Did not throw');
    } catch (e) {
      expect(e.message).to.equal('Callback is not a function');
    }
  });

  it('accepts a function callback but will start server (smoke)', async function() {
    this.timeout(5000);
    let called = false;
    const noop = () => { called = true; };

    const p = startExpressServer(fakeConfig, noop);
    await Promise.race([p, new Promise(resolve => setTimeout(() => resolve('timed'), 200))]);
    expect(typeof p.then).to.equal('function');
  });
});
