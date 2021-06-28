const BEP20TokenImplementation = artifacts.require("BEP20TokenImplementation");
const BSCSwapAgentImpl = artifacts.require("BSCSwapAgentImpl");
const ETHSwapAgentImpl = artifacts.require("ETHSwapAgentImpl");

const ERC20ABC = artifacts.require("ERC20ABC");
const ERC20DEF = artifacts.require("ERC20DEF");
const ERC20EMPTYSYMBOL = artifacts.require("ERC20EMPTYSYMBOL");
const ERC20EMPTYNAME = artifacts.require("ERC20EMPTYNAME");

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const MASK_TOKEN_ADDR_MAINNET = "0x69af81e73a73b40adf4f3d4223cd9b1ece623074";
const MASK_TOKEN_ADDR_ROPSTEN = "0x0f6d3ec17ad4be4641fff47b98d970a2845c1365";

module.exports = function(deployer, network, accounts) {
    const maskManagerAccount = accounts[0];
    console.log("network: " + network);

    if (network === "ropsten" || network === "mainnet" || network === "mainnet-fork" || network === "rinkeby") {
        let maskTokenAddr = MASK_TOKEN_ADDR_ROPSTEN;
        if (network === "mainnet") {
            maskTokenAddr = MASK_TOKEN_ADDR_MAINNET;
        }
        deployer.then(async () => {
            await deployer.deploy(ETHSwapAgentImpl, "10000000");
            const ETHSwapAgentContract = await ETHSwapAgentImpl.deployed();
            console.log("registerSwapPairToBSC: " + maskTokenAddr);
            console.log("ETH Agent Address: " + ETHSwapAgentContract.address);
            // const tx = await ETHSwapAgentContract.registerSwapPairToBSC(maskTokenAddr, {from: maskManagerAccount});
            // console.log("registerSwapPairToBSC hash: " + tx.tx);
        });
    }
    else if (network === "bsc_test" || network === "bsc_mainnet") {
        deployer.then(async () => {
            await deployer.deploy(BEP20TokenImplementation);
            await deployer.deploy(BSCSwapAgentImpl, BEP20TokenImplementation.address, "10000000000000000", maskManagerAccount);
            console.log("BEP20TokenImplementation address: " + BEP20TokenImplementation.address);

            const bscSwap = await BSCSwapAgentImpl.deployed();
            console.log("BSC Agent Address: " + bscSwap.address);
        });
    }
    else {
        owner = accounts[0];
        proxyAdmin = accounts[1];
        bep20ProxyAdmin = accounts[2];
        deployer.then(async () => {
            await deployer.deploy(ERC20ABC);
            await deployer.deploy(ERC20DEF);
            await deployer.deploy(ERC20EMPTYSYMBOL);
            await deployer.deploy(ERC20EMPTYNAME);

            await deployer.deploy(BEP20TokenImplementation);
            await deployer.deploy(BSCSwapAgentImpl, BEP20TokenImplementation.address, "10000000000000000", bep20ProxyAdmin);
            await deployer.deploy(ETHSwapAgentImpl, "10000000");
        });
    }
};
