updated 1
# testsol1
=======
# ETH BSC Swap Contracts

## Security Report

[here](SecurityAssessment.pdf)

## Overview
ETH BSC Swap Contracts are responsible for registering swap pairs and swapping assets between ETH and BSC.

![](./assets/eth-bsc-swap.png)

### Register swap pair

1. Users register swap pair for erc20 token on ETH via ETHSwapAgent(`createSwapPair`) if token is not registered.
2. Swap service will monitor the `SwapPairRegister` event and create swap pair on BSC: 
    
    1. create an BEP20 token on BSC
    2. record the relation between erc20 token and bep20 token.

### Swap from ETH to BSC

Once swap pair is registered, users can swap tokens from ETH to BSC.

1. Users call `swapBSC2ETH` via ETHSwapAgent and specify erc20 token address, amount and swap fee.
2. Swap service will monitor the `SwapStarted` event and call `fillETH2BSCSwap` via BSCSwapAgent to mint corresponding bep20
tokens to the same address that initiate the swap.

### Swap from BSC to ETH

Once swap pair is registered, users can swap tokens from BSC to ETH.

1. Users call `swapBSC2ETH` via BSCSwapAgent and specify bep20 token address, amount and swap fee. Bep20 tokens will be burned.
2. Swap service will monitor the `SwapStarted` event and call `fillBSC2ETHSwap` via BSCSwapAgent to transfer corresponding erc20
   tokens to the same address that initiate the swap.

## Generate contracts from templates

```javascript
npm run generate
```

## Test

Generate test contracts from templates:
```javascript
npm run generate-test
```

Run tests:

```javascript
npm run truffle:test
```

Run coverage:

```javascript
npm run coverage
```

## Deployed Contract

### ETH Swap Agent

| Chain | Address |
| ----- | ------- |
| Mainnet | [0xD25d84B9](https://etherscan.io/address/0xD25d84B989bFaFC2C77aB1d4FA1a04FC0eea9D24) |
| ~~Ropsten~~ | [0xfd7F535F](https://ropsten.etherscan.io/address/0xfd7F535F3268D5e4FB7f756a617f3B8616f5B03A) |
| Rinkeby | [0xBfF86b02](https://rinkeby.etherscan.io/address/0xBfF86b0234CCe74FDCb9C8897b2e33f385dfA83D) |

NOTE: Ropsten is broken.

### BSC Swap Agent

| Chain | Address |
| ----- | ------- |
| BSC | [0x05ee315E](https://bscscan.com/address/0x05ee315E407C21a594f807D61d6CC11306D1F149) |
| BSC-testnet | [0xc0145645](https://testnet.bscscan.com/address/0xc01456454c10E8118BbD069edc8DcFa66bCCA96F) |

### BSC-MASK-token

| Chain | Address |
| ----- | ------- |
| BSC | [0x2eD9a5C8](https://bscscan.com/address/0x2eD9a5C8C13b93955103B9a7C167B67Ef4d568a3) |
| BSC-testnet | [0x9ae8f356](https://testnet.bscscan.com/address/0x9ae8f356db5448ffbc8e3496ff8ca85536fc6031) |

## Interact with deployed contract

To interact with these smart contract, you can use web interfaces.

### Swap ETH MASK -> BSC MASK

[etherscan](https://etherscan.io/address/0xD25d84B989bFaFC2C77aB1d4FA1a04FC0eea9D24#readContract) - `swapETH2BSC`: use these parameters:
```
0.001                 // payableAmont
0x69af81e73a73b40adf4f3d4223cd9b1ece623074       // MASK token address
1000000000000000000              // amount, 1 MASK token
```

### Swap BSC MASK -> ETH MASK

[bscscan](https://bscscan.com/address/0x05ee315E407C21a594f807D61d6CC11306D1F149#writeContract) - `swapBSC2ETH` : use these parameters:
NOTE: you need to approve `BSC Swap Agent` MASK token allowance beforehand, see [script](./utils/bridge_tools.md) for more details.

```
0.01            // payableAmont
0x2ed9a5c8c13b93955103b9a7c167b67ef4d568a3       // MASK token address
1000000000000000000              // amount, 1 MASK token
```

Besides, this [script](./utils/bridge_tools.md) might make make your life easier.
