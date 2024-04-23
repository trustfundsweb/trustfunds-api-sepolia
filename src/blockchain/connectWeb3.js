const path = require("path");
const dotenv = require("dotenv");
const { ethers } = require("ethers");
const fs = require("fs-extra");

const contractABI = fs.readFileSync(
  path.join(__dirname, "..", "..", "blockchain", "Crowdfunding.abi"),
  "utf-8"
);
// path and env config
const root_dir = __dirname.split("src")[0];
dotenv.config({ path: path.join(root_dir, `.env`) });

const contractAddress = `${process.env.CONTRACT_ADDRESS}`;

console.log("Contract Address:", contractAddress);

// constants
const gasLimit = 6000000;
const accountIndex = 9;

console.log("Started calling blockchain");
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
console.log("RPC_URL:", process.env.RPC_URL);
const contract = new ethers.Contract(contractAddress, contractABI, provider);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
module.exports = {
  contract,
  signer,
  gasLimit,
  accountIndex,
  contractABI,
};
