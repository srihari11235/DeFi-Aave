import { HardhatUserConfig } from "hardhat/types";
import * as dotenv from 'dotenv';
dotenv.config();
import "hardhat-deploy"
import "@nomiclabs/hardhat-ethers";

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.7"
      },
      {
        version: "0.6.12"
      },
      {
        version: "0.4.19"
      }
    ]
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: MAINNET_RPC_URL,
      }
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    user: {
      default: 1
    }
  }
};

export default config
