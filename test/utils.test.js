const { expect } = require('chai');
const { mod } = require('../utils');

describe('utils.mod', () => {
  it('computes positive modulus correctly', () => {
    expect(mod(5, 3)).to.equal(2);
  });

  it('handles negative dividend', () => {
    expect(mod(-1, 3)).to.equal(2);
  });

  it('handles negative divisor by wrapping', () => {
    // behaviour defined in implementation ((x%y)+y)%y
    expect(mod(1, -3)).to.equal(-2);
  });

  it('zero divisor should produce NaN (JS behavior)', () => {
    const out = mod(1, 0);
    expect(Number.isNaN(out)).to.be.true;
  });
});
