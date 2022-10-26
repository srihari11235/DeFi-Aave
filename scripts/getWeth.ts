import { getNamedAccounts, ethers, network } from "hardhat";
import networkConfig from "../hardhat-helper.config";

const AMOUNT = ethers.utils.parseEther("0.01");

async function getWeth() {

    const { deployer } = await getNamedAccounts();
    const signer = await ethers.getSigner(deployer)

    //contract address of the wrapped ERC20 toekn is from Ethereum mainet. We have configured hardhat to fork the ethereum mainnet
    // since the mainet contains this contract we can use the address directly
    const iWeth = await ethers.getContractAt(networkConfig[network.config.chainId!].name, networkConfig[network.config.chainId!].wethTokenAddress, signer);

    //This is nothing but a ERC20 smart contract. We can deposit any amout to it and the amount will be saved as Wrapped ETH to be used by other contracts.
    const tx = await iWeth.deposit({ value: AMOUNT });
    await tx.wait(1);

    const depositedAmount = await iWeth.balanceOf(deployer);

    console.log(`Deposited amount: ${depositedAmount.toString()}`);

}

export default getWeth;