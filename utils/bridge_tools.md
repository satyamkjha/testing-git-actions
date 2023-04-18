# ETH BSC bridge tool

## Introduction

This is a NodeJs application to interact with ETH-BSC bridge.

To interact with a smart contract, you need a `network provider` and `an account`. This application uses `infura` as the provider. Besides, this application uses [dotenv](https://www.npmjs.com/package/dotenv) to read `infura key` and `accont private key` from your local file system. Therefore, before you use this it, you need to have your `infura key` and `accont private key` added in your `.env` file.

Example:

```shell
INFURA_API_KEY=FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
PRIV_KEY_TEST=0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
PRIV_KEY_DEPLOY=0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
```

## command list

Mint MASK test tokens, only works on test networks, like: Ropsten, etc

Example: Mint 1M MASK token

```shell
node bridge_tools.js mint_eth_mask_token
```

Approve `ETH Swap Agent` smart contract to use your MASK token(ETH network).

Example: Approve 1000 MASK tokens' allowance

```shell
node bridge_tools.js approve_eth_mask_token 1000
```

Swap `ETH MASK` -> `BSC MASK`

Example: Swap 2.5 MASK token, from `ETH MASK` -> `BSC MASK`

```shell
node bridge_tools.js swap_mask_eth_2_bsc 2.5
```

Approve `BSC Swap Agent` smart contract to use your MASK token(BSC network).

Example: Approve 1000 MASK tokens' allowance

```shell
node bridge_tools.js approve_bsc_mask_token 1000
```

Swap `BSC MASK` -> `ETH MASK`

Example: Swap 2.5 MASK token, from `BSC MASK` -> `ETH MASK`

```shell
node bridge_tools.js swap_mask_bsc_2_eth 2.5
```