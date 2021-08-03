# xToken APR Bot

A [Discord.js](https://github.com/discordjs/discord.js) bot that posts currently running incentive programs from [xtoken.cafe](https://xtoken.cafe/)

## Installation

Clone this repository and install dependencies with yarn:

```bash
git clone https://github.com/kritnich/xtoken-apr-bot
cd xtoken-apr-bot
yarn install
```

## Requirements
The bot needs to emulate a MetaMask wallet to use the [xToken/js](https://github.com/xtokenmarket/js) helpers, so it requires a connection to an Ethereum JSON RPC at least one account.

By default it expects a locally running [geth](https://github.com/ethereum/go-ethereum) instance (light mode works) with a single random account and accessible API. To customize this, edit `provider.js`.

## Configuration
The bot can be configured in `config.json`. It requires a bot token, the ID of a channel to post the updates into and a schedule to update in crontab form.

It can also take the configuration as the environment variables `XTK_BOT_TOKEN`, `XTK_CHANNEL` and `XTK_CRON`.

`pools.json` contains information about the incentivized pools, including their
names and contract addresses. It can be extended when new pools are added.
`type` refers to the type of staking token the pool holds:
 - `0` are simple xAssets
 - `1` are XLP assets (e.g. xU3LPa)
 - `2` are wETH-based LP tokens. For these, `asset` refers to the name of the LP
   token.

## Usage
Run inside the cloned repository:
```bash
node .
```

## License
[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)
