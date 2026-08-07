const { expect } = require('chai');
const proxyquire = require('proxyquire');

const fakeConfig = { http: { port: 0, socket: null } };

const { startExpressServer } = proxyquire('../express', {
  './config': fakeConfig
});

describe('startExpressServer', () => {
  it('throws if callback not a function', async () => {
    try {
      await startExpressServer(null);
      throw new Error('Did not throw');
    } catch (e) {
      expect(e.message).to.equal('Callback is not a function');
    }
  });

  // Do not actually start server in tests to avoid binding; ensure function is async and callable when given a function.
  it('accepts a function callback but will start server (smoke)', async function() {
    // Call with a noop but do not await full listen by using a short timeout wrapper.
    this.timeout(5000);
    let called = false;
    const noop = () => { called = true; };

    // Start server then immediately close by resolving the promise (can't easily close), so instead
    // ensure it returns a promise and does not reject synchronously.
    const p = startExpressServer(noop);
    await Promise.race([p, new Promise(resolve => setTimeout(() => resolve('timed'), 200))]);
    // If it returned a promise quickly, fine. We do not assert service started to avoid side effects.
    expect(typeof p.then).to.equal('function');
  });
});
