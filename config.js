import { resolve } from 'path';
const configPath = process.env.PYDT_NOTIFIER_CONFIG || process.argv[2] || './config.json';
export default import(resolve(configPath)).then(m => m.default);
