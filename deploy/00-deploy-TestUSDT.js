const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("Deploying TestUSDT and waiting for confirmations...")
    const USDTcontract = await deploy("TestUSDT", {
        from: deployer,
        args: [deployer],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`TestUSDT deployed at ${USDTcontract.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(USDTcontract.address, [deployer])
    }
}

module.exports.tags = ["all", "usdt"]
