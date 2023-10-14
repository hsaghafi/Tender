const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let USDTAddress
    if (chainId == 31337) {
        const ethUSDT = await deployments.get("TestUSDT")
        USDTAddress = ethUSDT.address
    } else {
        USDTAddress = networkConfig[chainId]["TestUSDT_address"]
    }
    log("----------------------------------------------------")
    log("Deploying Tender and waiting for confirmations...")
    const tender = await deploy("Tender", {
        from: deployer,
        args: [USDTAddress],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`Tender deployed at ${tender.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(tender.address, [USDTAddress])
    }
}

module.exports.tags = ["all", "tender"]
