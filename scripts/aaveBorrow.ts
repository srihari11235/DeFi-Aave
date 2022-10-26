import { Contract, Signer } from "ethers";
import { ethers, getNamedAccounts, network } from "hardhat";
import { text } from "stream/consumers";
import networkConfig from "../hardhat-helper.config";
import getWeth from "./getWeth";

async function main() {
    //deposit amount to store WEth in contract for deployer address    
    await getWeth();
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.getSigner(deployer)
    const lendingPool = await getLendingPool(signer);

    //approve the lendingPool contract to take money from the WEth contract. We need to approve, otherwise lending pool will not be able to take the WEth.
    //WEth smart contract has the wrapped eth in it
    await approveERC20(networkConfig[network.config.chainId!].wethTokenAddress, lendingPool.address, networkConfig[network.config.chainId!].amount, signer);

    console.log("Depositing..");
    //by calling this method, the WEth in WEth contract is taken by lendingPool contract internally [which is approved above]. 
    //Underlaying implmentation of deposit method enables inter smart contract method calls.
    //this then sends aTokens( aave tokens) to the 'deployer' account
    await lendingPool.deposit(networkConfig[network.config.chainId!].wethTokenAddress, networkConfig[network.config.chainId!].amount, deployer, 0);
    console.log("Deposited");


    const { availableBorrowsETH } = await getBorrowUserInfo(lendingPool, deployer);

    const priceOfDai = await getDaiPrice();
    const amountOfDaiToBorrow = availableBorrowsETH.div(priceOfDai);
    const amountOfDaiToBorrowWei = ethers.utils.parseEther(amountOfDaiToBorrow.toString());

    console.log(`You can borrow ${amountOfDaiToBorrow.toString()} DAI`)

    //pass the erc20 token address from which you want to borrow. Here we have used DAI, hence we have passed the DAI ERC20 token address
    //interestRateMode : 1 - stable
    await lendingPool.borrow(networkConfig[network.config.chainId!].daiTokenAddress, amountOfDaiToBorrowWei, 1, 0, deployer);

    //display the new borrow info.
    await getBorrowUserInfo(lendingPool, deployer);

    await repay(networkConfig[network.config.chainId!].daiTokenAddress, lendingPool, amountOfDaiToBorrowWei.toString(), signer);

    /** NOTE
     * On Repayment of the borrowed DAI, notice that there is still a small amount of ETH remaining. This is the interest gained when you borrowed DAI.
     * The repay method currently is only repaying the borrowed DAI but not the interest.
     * To repay the interest of DAI, we can use coin swap to give WETH and obtain DAI in return and repay the remaining amount.
    */

    //display the new borrow info.
    await getBorrowUserInfo(lendingPool, deployer);
}

async function repay(daiTokenAddress: string, lendingPool: Contract, amount: string, signer: Signer) {

    //to give back the borrowed DAI we nned to approve it.
    //As DAI is also a ERC20 token. There is a method approve available in the DAI contract which we can use to approve the transaction from lendingPool to DAI.
    await approveERC20(daiTokenAddress, lendingPool.address, amount, signer);

    const repayTx = await lendingPool.repay(daiTokenAddress, amount, 1, signer.getAddress());
    await repayTx.wait(1)
}

async function getLendingPool(signer: Signer) : Promise<Contract> {
    const provider = await ethers.getContractAt("ILendingPoolAddressesProvider", networkConfig[network.config.chainId!].lendingPoolAddressesProviderAddress);
    const lendingPoolAddress = await provider.getLendingPool(); 
    const lendingPool =  await ethers.getContractAt("ILendingPool", lendingPoolAddress, signer);
    return lendingPool;
}

async function approveERC20(erc20TokenAddress: string, spenderAddress:string, amount: string, signer: Signer) {
    const iWeth = await ethers.getContractAt(networkConfig[network.config.chainId!].name, erc20TokenAddress, signer);

    const tx = await iWeth.approve(spenderAddress, amount);
    await tx.wait(1);
    console.log("Approved!");
}

//use getUserAccountData method to get information about the amount deposited, current debt and how much can be borrowed. 
async function getBorrowUserInfo(lendingPool: Contract, deployer: string) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(deployer);
    console.log(`YOu have ${totalCollateralETH} deposited`);
    console.log(`You have ${totalDebtETH} borrowed`);
    console.log(`You have ${availableBorrowsETH} available to borrow`);

    return { totalCollateralETH, availableBorrowsETH };
}

//using chainlink aggregatorV3Interface and address for DAI/ETH - we can get price of DAI.
async function getDaiPrice() {
    const priceFeed = await ethers.getContractAt("AggregatorV3Interface", networkConfig[network.config.chainId!].daiEthAggregatorV3Interface);

    const price = (await priceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price;
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1); 
    })