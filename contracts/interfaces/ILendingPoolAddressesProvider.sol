//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";

/**
 * This contract is used to get the latest/valid ILendingPool contract address which can be used for DeFi interactions.
 * This is done for the upgradebility of the contract.
 *  */
