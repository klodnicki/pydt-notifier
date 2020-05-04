# PYDT Notifier
Hook ["Play Your Damn Turn"](https://www.playyourdamnturn.com/) turn
notifications to [Discord](https://discordapp.com/)

## Message System

Messages are configurable in your config file, using
[handlebars](https://handlebarsjs.com/guide) for templating and logic.

Every time a turn rollover happens, the `message` string in your config JSON
file is templated and then sent to Discord. A simple example of a meaningful
message is `"{{nextPlayer.friendlyName}}'s turn!"`.

There is a lot of data available for you to template in, there are places for
you to add your own data for whatever you want, and there are helpers
available to make your templating more convenient.

### Available Data

- `prevPlayer`: The config object for the player that just completed their
  turn. If you want to add extra data for a player, add it to that player's
  `messageData`.
- `nextPlayer`: The config object for the player that will go next.
- `gameName`: The PYDT name of the game
- `game`: The config object for the game

### Places to add more data

If you want extra data to use (lists of messages, player attributes, etc),
there are reserved places to put them. Do **not** add data into a config
object outside of these designated places, even if it works. There may be
conflicts with your property names in the future.

- You can add data to the `messageData` property in the root. Everything in
  that object is added to the global namespace for templating.
- You can add data to the `messageData` property of a game. This object will
  be accessible in templating through `game.messageData`.
- You can add data to the `messageData` property of a player. This object will
  be accessible in templating through `(player).messageData`.

### Helpers

- `source str`: Simple template the given string. Convenient for
  compartmentalizing different parts of your message.
- `discordTag player`: It expects a player object (e.g. `nextPlayer` or
  `prevPlayer`) and inserts a Discord tag toward that person. You cannot
  customize the name that is displayed, that's a Discord limitation.
- `randomMessageIn arr`: It expects an array of strings. It will pick a random
  one and template it.

### Complex Example

Here is an example config file with complex templating logic:

```json
{
    "http": {
        "port": 7531
    },
    "discord": {
        "clientToken": "..."
    },
    "games": {
        "My Game": {
            "discord": {
                "targetChannel": "..."
            },
            "players": [
                {
                    "pydtName": "playera",
                    "friendlyName": "Player A",
                    "discordId": "...",
                    "messageData": {
                        "customThanks": [
                            "A just finished the perfect turn.",
                            "A, your turns are always awesome."
                        ]
                    }
                },
                {
                    "pydtName": "playerb",
                    "friendlyName": "Player B",
                    "discordId": "...",
                    "messageData": {
                        "customUpNext": [
                            "Let's see what {{ discordTag nextPlayer }} is going to screw up this time.",
                            "Oh no, {{ discordTag nextPlayer }} is up next!"
                        ]
                    }
                },
                {
                    "pydtName": "playerc",
                    "friendlyName": "Player C",
                    "discordId": "...",
                    "messageData": {
                        "customUpNext": [
                            "Let's see what {{ discordTag nextPlayer }} is going to screw up this time.",
                            "Oh no, {{ discordTag nextPlayer }} is up next!"
                        ]
                    }
                }
            ],
            "messageData": {
                "customName": "Our First Game"
            }
        }
    },
    "message": "{{ game.messageData.customName }}: {{ source thanksPart }} {{ source upNextPart }}",
    "messageData": {
        "thanksPart": "{{#if prevPlayer.messageData.customThanks}}{{randomMessageIn prevPlayer.messageData.customThanks}}{{else}}{{ randomMessageIn thanksMessages }}{{/if}}",
        "upNextPart": "{{#if nextPlayer.messageData.customUpNext}}{{randomMessageIn nextPlayer.messageData.customUpNext}}{{else}}{{ randomMessageIn upNextMessages }}{{/if}}",
        "thanksMessages": [
            "Thanks for doing your turn, {{prevPlayer.friendlyName}}!",
            "Thanks, {{prevPlayer.friendlyName}}, for doing your turn!"
        ],
        "upNextMessages": [
            "How will you respond, {{discordTag nextPlayer}}?",
            "You're up, {{discordTag nextPlayer}}!"
        ]
    }
}
```

Suppose that Player A just finished their turn, so now Player B is up.

- - The templating engine starts with the root `message`:
- `"{{ game.messageData.customName }}: {{ source thanksPart }} {{ source upNextPart }}"`
- - This is just an easy substitution. It'll find the game config and
    substitute in `messageData.customName`, which is set to
    `"Our First Game"`.
- `"Our First Game: {{ source thanksPart }} {{ source upNextPart }}"`
- - `source` is a helper, and `thanksPart` is a string defined in
    `messageData`. It substitutes that string in and templates it.
- `"Our First Game: {{#if prevPlayer.messageData.customThanks}}{{randomMessageIn prevPlayer.messageData.customThanks}}{{else}}{{ randomMessageIn thanksMessages }}{{/if}} {{ source upNextPart }}"`
- - `prevPlayer` is Player A, so `prevPlayer.messageData.customThanks` is an
    array of strings. Since it's truthy, the first path of the big if block is
    kept.
- `"Our First Game: {{randomMessageIn prevPlayer.messageData.customThanks}} {{source upNextPart }}"`
- - `randomMessageIn` is a helper function, and
    `prevPlayer.messageData.customThank` is an array of strings. It will pick
    a random one of these and template it.
- `"Our First Game: A just finished the perfect turn. {{ source upNextPart }}"`
- - This time we source the `upNextPart` string defined in `messageData`.
- `"Our First Game: A just finished the perfect turn. {{#if nextPlayer.messageData.customUpNext}}{{randomMessageIn nextPlayer.messageData.customUpNext}}{{else}}{{ randomMessageIn upNextMessages }}{{/if}}"`
- - `nextPlayer` is Player B, so `nextPlayer.messageData.customUpNext` is
    undefined. That's falsy, so it keeps the else block.
- `"Our First Game: A just finished the perfect turn. {{ randomMessageIn upNextMessages }}`
- - `upNextMessages` is defined in `messageData`. `randomMessageIn` will pick
    a random string from there and template it.
- `"Our First Game: A just finished the perfect turn. You're up, {{discordTag nextPlayer}}!`
- - This last one is easy, it will "at" the next player (Player B) in the
    Discord message.
- `"Our First Game: A just finished the perfect turn. You're up, <@PlayerB>!"`

