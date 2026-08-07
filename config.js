/**
 * @typedef {Object} PydtNotification
 * @property {string} gameName
 * @property {string} userName
 * @property {number} [round]
 * @property {string} [civName]
 * @property {string} [leaderName]
 * @property {*} [value1]
 * @property {*} [value2]
 * @property {*} [value3]
 */

/**
 * @typedef {Object} Player
 * @property {string} pydtName
 * @property {string} friendlyName
 * @property {string} discordId
 * @property {Object} [messageData]
 */

/**
 * @typedef {Object} GameEntry
 * @property {{ targetChannel: string }} discord
 * @property {Player[]} players
 * @property {Object} [messageData]
 */

/**
 * @typedef {Object} Config
 * @property {{ port: number, socket: string|null }} http
 * @property {{ clientToken: string }} discord
 * @property {Object.<string, GameEntry>} games
 * @property {string} message
 * @property {Object} messageData
 * @property {PydtNotification} [testNotification]
 */

/** @type {Config} */
module.exports = require(require('path').resolve(process.env.PYDT_NOTIFIER_CONFIG || process.argv[2] || './config.json'));
