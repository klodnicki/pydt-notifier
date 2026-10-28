# Repository Instructions

## Project Map

This is a Node.js service that receives Play Your Damn Turn notifications
over HTTP and sends templated messages to Discord.

- `index.js`: CLI entry point; creates the bot and starts the HTTP server.
- `express.js`: notification endpoint and TCP/Unix socket setup.
- `bot.js`: game/player lookup and notification orchestration.
- `discordInterface.js`: Discord login, channel lookup, and message delivery.
- `messageGenerator.js`: Handlebars templates and custom helpers.
- `config.js`: configuration loading and JSDoc data types.
- `types.d.ts`: shared global interfaces for checked JavaScript.
- `test/*.test.js`: Mocha tests.
- `README.md`: message templates, helpers, and configuration examples.
- `.github/workflows/`: tests, type checking, and production deployment.

## Setup and Checks

Use the Node.js version in `.nvmrc`; CI reads that file too. With nvm:

```sh
nvm install
nvm use
npm ci
PYDT_NOTIFIER_CONFIG=./config-template.json npm test
npm run typecheck
```

Run both tests and type checking before submitting code changes. For focused
tests, use the same configuration environment variable:

```sh
PYDT_NOTIFIER_CONFIG=./config-template.json npm test -- test/bot.test.js
```

There is no lint or build script. Type checking uses `tsc --noEmit` with
strict `checkJs`; it covers root JavaScript and declaration files, not tests.
The Express tests bind ephemeral local ports, and the test script uses
Mocha's `--exit` because server handles remain open.

## Code Conventions

- Keep the existing CommonJS JavaScript structure (`require` and
  `module.exports`); do not migrate to TypeScript or ES modules incidentally.
- Follow `.editorconfig`: four-space indentation, final newlines, and
  Markdown/text lines no longer than 78 characters. `package.json` uses
  two-space indentation. Match local style in existing test files.
- Maintain JSDoc annotations and update `types.d.ts` when changing shared
  interfaces. Prefer accurate types over new type-check suppressions.
- Use the existing Mocha, Chai, Sinon, and Proxyquire testing patterns.
  Stub Discord and configuration dependencies rather than calling Discord.
- Add regression tests for changed behavior. Keep dependency and lockfile
  updates scoped to the task; use npm when dependencies must change.

## Configuration and Side Effects

- Configuration is loaded at module import time. Precedence is
  `PYDT_NOTIFIER_CONFIG`, then the first CLI argument, then `./config.json`;
  paths resolve from the current working directory.
- Use `config-template.json` for checks. Even Proxyquire-based tests can load
  the real configuration module, so keep the environment variable set.
- Never commit credentials or real `config.json` files. Keep example tokens
  and channel IDs empty or obviously fake.
- Do not start `index.js` as a routine check: constructing the Discord
  interface initiates login, and `testNotification`, when configured, sends
  a notification on startup.
- Unix socket startup can remove an existing socket path and invokes
  `chgrp www-data` and `chmod 770`; avoid production paths during testing.
- Put custom template data in the designated `messageData` objects. Check
  `messageGenerator.js` and its tests for actual template context behavior,
  and update README examples when changing helpers or configuration.

## Delivery

- Keep changes focused and report the checks run, including any that could
  not run.
- Push a topic branch and open a pull request against `main`. A push to
  `main` triggers production deployment; do not deploy as a validation step.
- `npm run pack` creates the deployment archive and removes matching local
  package archives first. Run it only when packaging needs verification.
