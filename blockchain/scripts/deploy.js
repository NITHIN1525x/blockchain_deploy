// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying FreelanceEscrow contract...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log(`📍 Deploying from: ${deployer.address}`);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);

    // Platform fee = 2%
    const PLATFORM_FEE = 2;

    // Deploy contract
    const FreelanceEscrow = await hre.ethers.getContractFactory("FreelanceEscrow");
    const escrow = await FreelanceEscrow.deploy(PLATFORM_FEE);

    await escrow.waitForDeployment();

    const contractAddress = await escrow.getAddress();

    console.log("✅ FreelanceEscrow deployed!");
    console.log(`📄 Contract Address: ${contractAddress}`);
    console.log(`🔧 Platform Fee: ${PLATFORM_FEE}%`);
    console.log(`👑 Admin: ${deployer.address}`);

    // Save deployment info
    const fs = require("fs");
    const deploymentInfo = {
        contractAddress,
        deployer: deployer.address,
        platformFee: PLATFORM_FEE,
        network: hre.network.name,
        deployedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
        "deployment.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📁 Deployment info saved to deployment.json");
    console.log("\n⚠️  Copy contract address to frontend!");
    console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
