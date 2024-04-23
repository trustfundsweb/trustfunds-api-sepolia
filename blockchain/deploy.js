const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs-extra");
const dotenv = require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

async function main() {
  const url = process.env.RPC_URL;
  const provider = new ethers.JsonRpcProvider(url);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const abi = fs.readFileSync("blockchain/Crowdfunding.abi", "utf-8");
  const bin = fs.readFileSync("blockchain/Crowdfunding.bin", "utf-8");

  const contractFactory = new ethers.ContractFactory(abi, bin, wallet);
  const contract = await contractFactory.deploy();
  console.log("Deploying contract...");
  const response = await contract.waitForDeployment();
  console.log({ transactionResponse: response.deploymentTransaction() });
}

main();
