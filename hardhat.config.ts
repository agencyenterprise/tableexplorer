import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-solhint'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import { config } from 'dotenv'
import 'hardhat-contract-sizer'
import 'hardhat-gas-reporter'
import { HardhatUserConfig } from 'hardhat/config'
import 'solidity-coverage'

config()

const { ETHERSCAN_API_KEY } = process.env

const hardhatConfig: HardhatUserConfig = {
  solidity: {
    version: '0.8.15',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    coinmarketcap: `96ccddf9-ef62-4684-86a1-1df7a393fcb6`,
    gasPrice: 50
  },
  paths: {
    tests: './test'
  },
  networks: {
    mumbai: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/PTbEov9b9XjfTgmiT9nuDM80Wl98Qg3t',
      gas: 21000,
      gasPrice: 8000000000
    },
    polygon: {
      url: 'https://polygon-mainnet.g.alchemy.com/v2/JRptRNLZzr65CeN9PyapuBIFbFMu7CtM'
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
}

export default hardhatConfig
