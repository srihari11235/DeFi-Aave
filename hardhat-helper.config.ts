import { ethers } from "hardhat"


export interface INetworkConfig {
    name: string,
    wethTokenAddress: string, 
    amount: string,
    lendingPoolAddressesProviderAddress: string,
    daiEthAggregatorV3Interface: string,
    daiTokenAddress: string
}

export interface INetwrokConfigs {
    [key: number] : INetworkConfig
}


const networkConfig: INetwrokConfigs = {
    31337: {
        name: "IWeth",
        wethTokenAddress : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        amount: ethers.utils.parseEther("0.01").toString(),
        lendingPoolAddressesProviderAddress: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        daiEthAggregatorV3Interface: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        daiTokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    }
}

export default networkConfig