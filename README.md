# xToken APR Webhook

A tool that posts currently running incentive programs from [xtoken.cafe](https://xtoken.cafe/) into Discord using webhooks.

## Installation

Clone this repository and install dependencies with yarn:

```bash
git clone https://github.com/kritnich/xtoken-apr-webhook
cd xtoken-apr-webhook
yarn install
```

## Requirements
The tool needs to emulate a MetaMask wallet to use the [xToken/js](https://github.com/xtokenmarket/js) helpers, so it requires a connection to an Ethereum JSON RPC with at least one account.

By default it expects a locally running [geth](https://github.com/ethereum/go-ethereum) instance (light mode works) with a single random account and accessible API. To customize this, edit `provider.js`.

## Configuration
`pools.json` contains information about the incentivized pools, including their
names and contract addresses. It can be extended when new pools are added.
`type` refers to the type of staking token the pool holds:
 - `0` are simple xAssets. `name` should resolve to a `symbol` returned by
   `getXAssets()`
 - `1` are XLP assets (e.g. xU3LPa). `name` should resolve to a `symbol`
   returned by `getXLPAssets()`
 - `2` are wETH-based LP tokens. `asset` should resolve to an `asset` returned
   by `getLiquidityPoolsItems()`

## Usage
Run inside the cloned repository:
```bash
node . "$WEBHOOKURL"
```

## License
[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)
