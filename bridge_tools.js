require("dotenv").config();
const ethers = require("ethers");

// TODO: organize these into a config file
const ethContractArtifact = require("./utils/abi/ETHSwapAgentImpl.json");
const bscContractArtifact = require("./utils/abi/BSCSwapAgentImpl.json");
const bscMaskContractArtifact = require("./utils/abi/BEP20TokenImplementation.json");
const ethMaskContractArtifact = require("./utils/abi/MaskToken.json");
const bscMaskProxy = require("./utils/abi/BEP20UpgradeableProxy.json");

let bscProxyApp;

let ethContractApp;
let ethMaskContractApp;

let bscContractApp;
let bscMaskContractApp;

let ethMainWallet;
let bscMainWallet;

let ethContractAddr;
let bscContractAddr;
let bscMaskAddr;
let ethMaskAddr;

let ethNetworkProvider;
let bscNetworkProvider;

const ethToBscSwapFee = ethers.utils.parseUnits('0.00000000001', 'ether');
const bscToEthSwapFee = ethers.utils.parseUnits('0.01', 'ether');

//----------------------------------------
const ethTransactionParameters = {
    gasLimit: 300000,
    gasPrice: ethers.utils.parseUnits('50', 'gwei'),
    // value: ethers.utils.parseUnits('0.00000000001', 'ether')
};

const bscTransactionParameters = {
    gasLimit: 300000,
    gasPrice: ethers.utils.parseUnits('25', 'gwei'),
    // value: ethers.utils.parseUnits('0.01', 'ether')
};
//------------------------------------------------------------------------------------------------
// const network = "testnet";
const network = "rinkeby";

async function main() {
    if (network === "mainnet") {
        ethContractAddr = "0xD25d84B989bFaFC2C77aB1d4FA1a04FC0eea9D24";
        bscContractAddr = "0x05ee315E407C21a594f807D61d6CC11306D1F149";
        bscMaskAddr = "0x2ed9a5c8c13b93955103b9a7c167b67ef4d568a3";
        ethMaskAddr = "0x69af81e73a73b40adf4f3d4223cd9b1ece623074";
        // set gas price carefully, it is expensive.
        ethTransactionParameters.gasLimit = 1000000;
        ethTransactionParameters.gasPrice = ethers.utils.parseUnits('10', 'gwei');
        bscTransactionParameters.gasPrice = ethers.utils.parseUnits('5', 'gwei');
        ethNetworkProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY);
        bscNetworkProvider = new ethers.providers.StaticJsonRpcProvider('https://bsc-dataseed1.binance.org:443');
    }
    else if(network === "rinkeby")
    {
        ethContractAddr = "0xBfF86b0234CCe74FDCb9C8897b2e33f385dfA83D";
        bscContractAddr = "0xc01456454c10E8118BbD069edc8DcFa66bCCA96F";
        bscMaskAddr = "0x9Ae8f356dB5448fFbC8e3496fF8ca85536Fc6031";
        ethMaskAddr = "0x46eD2e50A9f27de0dC47b04E7580E8E91fCE7246";
        ethNetworkProvider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/" + process.env.INFURA_API_KEY);
        bscNetworkProvider = new ethers.providers.StaticJsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
    }
    else {
        // Ropsten, at the moment, it is broken because of the `EIP-1559 upgrade`.
        ethContractAddr = "0xF223070819EF55eD148A48D29377fb38E360f182";
        bscContractAddr = "0xc01456454c10E8118BbD069edc8DcFa66bCCA96F";
        bscMaskAddr = "0x778f3a2eaeabc4abce1418e8b7872a4a6989d07a";
        ethMaskAddr = "0x0f6d3eC17ad4BE4641Fff47B98d970A2845C1365";
        // ethTransactionParameters.gasPrice = ethers.utils.parseUnits('20', 'gwei');
        ethNetworkProvider = new ethers.providers.JsonRpcProvider("https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY);
        bscNetworkProvider = new ethers.providers.StaticJsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
    }
    bscMainWallet = new ethers.Wallet(process.env.PRIV_KEY_TEST, bscNetworkProvider);
    ethMainWallet = new ethers.Wallet(process.env.PRIV_KEY_TEST, ethNetworkProvider);
    bscContractApp = new ethers.Contract(
        bscContractAddr,
        bscContractArtifact.abi,
        bscMainWallet
    );
    bscMaskContractApp = new ethers.Contract(
        bscMaskAddr,
        bscMaskContractArtifact.abi,
        bscMainWallet
    );
    bscProxyApp = new ethers.Contract(
        bscMaskAddr,
        bscMaskProxy.abi,
        bscMainWallet
    );

    ethContractApp = new ethers.Contract(
        ethContractAddr,
        ethContractArtifact.abi,
        ethMainWallet
    );
    ethMaskContractApp = new ethers.Contract(
        ethMaskAddr,
        ethMaskContractArtifact.abi,
        ethMainWallet
    );
    console.log("network: " + network + " wallet address: " + ethMainWallet.address);

    const action = process.argv[2];
    if (action === "register_eth_mask_token") {
        const tx = await ethContractApp.registerSwapPairToBSC(ethMaskAddr, ethTransactionParameters);
        await tx.wait();
        return;
    }
    if (action === "mint_eth_mask_token") {
        const allowance = ethers.utils.parseUnits("1000000", 18);
        console.log("Mint MASK test token");
        const tx = await ethMaskContractApp.mint(ethMainWallet.address, allowance, ethTransactionParameters);
        await tx.wait();
    }
    else if (action === "approve_eth_mask_token")
    {
        if (process.argv.length < 4) {
            console.log('Usage: "node bridge_tools approve_eth_mask_token AMOUNT"');
            throw "invalid parametrer";
        }
        const amount = process.argv[3];
        const allowance = ethers.utils.parseUnits(amount, 18);
        console.log("Approve " + amount + " MASK tokens");
        const tx = await ethMaskContractApp.approve(ethContractAddr, allowance, ethTransactionParameters);
        await tx.wait();
    }
    else if (action === "transfer_eth_agent_ownership")
    {
        if (process.argv.length < 4) {
            console.log('Usage: "node bridge_tools transfer_eth_agent_ownership NEW_OWNER_ADDRESS"');
            throw "invalid parametrer";
        }
        const isOwner = await isContractOwner(bscContractApp, ethMainWallet.address);
        if (!isOwner) {
            console.log("you are not the owner.");
            return;
        }

        const new_owner = process.argv[3];
        console.log("transfer ownership to: " + new_owner);
        const tx = await ethContractApp.transferOwnership(new_owner, ethTransactionParameters);
        await tx.wait();
    }
    else if (action === "swap_mask_eth_2_bsc")
    {
        if (process.argv.length < 4) {
            console.log('Usage: "node bridge_tools approve_eth_mask_token AMOUNT"');
            throw "invalid parametrer";
        }
        const amount = process.argv[3];
        ethTransactionParameters.value = ethToBscSwapFee;
        const maskSwapAmount = ethers.utils.parseUnits(amount, 18);
        console.log("Mask swap amount: " + amount);
        const tx = await ethContractApp.swapETH2BSC(ethMaskAddr, maskSwapAmount.toString(), ethTransactionParameters);
        await tx.wait();
    }
    else if (action === "set_eth_swap_fee")
    {
        if (process.argv.length < 4) {
            console.log('Usage: "node bridge_tools approve_eth_mask_token AMOUNT"');
            throw "invalid parametrer";
        }
        const isOwner = await isContractOwner(ethContractApp, ethMainWallet.address);
        if (!isOwner) {
            console.log("you are not the owner.");
            return;
        }
        const currentFee = await ethContractApp.swapFee();
        console.log("ETH -> BSC, fee: " + ethers.utils.formatUnits(currentFee.toString(), 18) + " ETH");
        const newFeeStr = process.argv[3];
        console.log("ETH -> BSC, set fee: " + newFeeStr + " ETH");
        const newFee = ethers.utils.parseUnits(newFeeStr, 18);
        const tx = await ethContractApp.setSwapFee(newFee, ethTransactionParameters);
        await tx.wait();
    }
    else if (action === "approve_bsc_mask_token")
    {
        if (process.argv.length < 4) {
            console.log('Usage: "node bridge_tools approve_bsc_mask_token AMOUNT"');
            throw "invalid parametrer";
        }
        const tx = await bscMaskContractApp.approve(bscContractAddr, ethers.utils.parseUnits("1000000", 18).toString(), bscTransactionParameters)
        await tx.wait();
    }
    else if (action === "swap_mask_bsc_2_eth")
    {
        if (process.argv.length < 4) {
            console.log('Usage: "node bridge_tools transfer_bsc_agent_ownership NEW_OWNER_ADDRESS"');
            throw "invalid parametrer";
        }
        const amount = process.argv[3];

        bscTransactionParameters.value = bscToEthSwapFee;
        const maskSwapAmount = ethers.utils.parseUnits(amount, 18);
        console.log("Mask swap amount: " + ethers.utils.formatUnits(maskSwapAmount.toString(), 18));
        const tx = await bscContractApp.swapBSC2ETH(bscMaskAddr, maskSwapAmount.toString(), bscTransactionParameters);
        await tx.wait();
    }
    else if (action === "transfer_bsc_agent_ownership")
    {
        if (process.argv.length < 4) {
            console.log('Usage: "node bridge_tools transfer_bsc_agent_ownership NEW_OWNER_ADDRESS"');
            throw "invalid parametrer";
        }
        const isOwner = await isContractOwner(bscContractApp, bscMainWallet.address);
        if (!isOwner) {
            console.log("you are not the owner.");
            return;
        }

        const new_owner = process.argv[3];
        console.log("transfer ownership to: " + new_owner);
        const tx = await bscContractApp.transferOwnership(new_owner, bscTransactionParameters);
        await tx.wait();
    }
    else if (action === "transfer_bsc_mask_admin")
    {
        const admin = await getProxyAdminAddr(bscNetworkProvider, bscProxyApp.address);
        console.log("current admin: " + admin);
        if (admin.toLowerCase() != bscMainWallet.address.toLowerCase()) {
            console.log("you are not the admin");
            return;
        }
        // TransparentUpgradeableProxy
        const new_owner = process.argv[3];
        console.log("transfer admin to: " + new_owner);
        const tx = await bscProxyApp.changeAdmin(new_owner, ethTransactionParameters);
        await tx.wait();
    }
    else if (action === "set_bsc_swap_fee")
    {
        if (process.argv.length < 4) {
            console.log('Usage: "node bridge_tools approve_eth_mask_token AMOUNT"');
            throw "invalid parametrer";
        }
        const isOwner = await isContractOwner(bscContractApp, bscMainWallet.address);
        if (!isOwner) {
            console.log("you are not the owner.");
            return;
        }
        const currentFee = await bscContractApp.swapFee();
        console.log("BSC --> ETH, fee: " + ethers.utils.formatUnits(currentFee.toString(), 18) + " BNB");
        const newFeeStr = process.argv[3];
        console.log("BSC --> ETH, set fee: " + newFeeStr + " BNB");
        const newFee = ethers.utils.parseUnits(newFeeStr, 18);
        const tx = await bscContractApp.setSwapFee(newFee, ethTransactionParameters);
        await tx.wait();
    }
    else if (action === "stress_test_eth_2_bsc")
    {
        ethTransactionParameters.value = ethToBscSwapFee;
        // stress test
        const startMaskAmont = ethers.utils.parseUnits("0.1", 18);
        const incrementAmont = ethers.utils.parseUnits("0.1", 18);
        let maskSwapAmount = startMaskAmont;
        for (let i = 0; i < 1000; i++)
        {
            console.log("round: " + i + " mask swap amount: " + ethers.utils.formatUnits(maskSwapAmount.toString(), 18));
            const tx = await ethContractApp.swapETH2BSC(ropsten_mask, maskSwapAmount.toString(), ethTransactionParameters);
            await tx.wait();
            maskSwapAmount = maskSwapAmount.add(incrementAmont);
        }
    }
    else if (action === "stress_test_bsc_2_eth")
    {
        // stress test
        // TODO
    }
    else {
        throw "unknown command option";
    }
}

async function isContractOwner(contract, addr) {
    const owner = await contract.owner();
    console.log("owner: " + owner);
    if (owner != addr) {
        return false;
    }
    return true
}

async function getProxyAdminAddr(provider, deployedProxyAddr) {
    const adminStoragePosition = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
    const storage = await provider.getStorageAt(deployedProxyAddr, adminStoragePosition);
    const addrStoragePrefix = '0x000000000000000000000000';
    if (storage.startsWith(addrStoragePrefix) === false) {
        console.log("invalid address: " + storage);
        return "0x00";
    }
    const adminAddr = '0x' + storage.substring(addrStoragePrefix.length);
    return adminAddr;
}

main().then(function() {
});
