require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const privateKey = process.env.PRIVATE_KEY || "";
const hasValidPrivateKey = /^0x[a-fA-F0-9]{64}$/.test(privateKey);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Local hardhat network for testing
    hardhat: {
      chainId: 31337,
    },

    // Sepolia testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: hasValidPrivateKey ? [privateKey] : [],
      chainId: 11155111,
    },
  },

  // For contract verification on Etherscan
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },

  // Gas reporter
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};
