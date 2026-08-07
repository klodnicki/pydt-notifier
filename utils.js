/**
 * Computes the modulo operation that always returns a positive result.
 * @param {number} x - The dividend
 * @param {number} y - The divisor
 * @returns {number} The positive modulo result
 */
function mod(x, y) {
    return ((x % y) + y) % y;
}

module.exports = { mod };
