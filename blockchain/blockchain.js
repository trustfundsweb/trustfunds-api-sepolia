const { ethers, BaseContract } = require("ethers");
const fs = require("fs-extra");

console.log("Started calling blockchain");
const abi = fs.readFileSync(
  path.join(__dirname, "Crowdfunding.abi"),
  "utf-8"
);

// Connect to the Ethereum network
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Your contract's address and ABI
const contractAddress = process.env.CONTRACT_ADDRESS;

// Connect to the contract
const contract = new ethers.Contract(contractAddress, abi, provider);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function addManager(newManagerAddress) {
  const contractWithSigner = contract.connect(signer);
  const tx = await contractWithSigner.addManager(newManagerAddress);
  await tx.wait();
  console.log(`Transaction hash: ${tx.hash}`);
}

async function fundProject(value) {
  const contractWithSigner = contract.connect(signer);
  const tx = await contractWithSigner.fundProject({
    value: ethers.parseEther(value.toString()),
  });
  await tx.wait();
  console.log(`Transaction hash: ${tx.hash}`);
}

async function updatePhase(updates) {
  const contractWithSigner = contract.connect(signer);
  const tx = await contractWithSigner.updatePhase(updates);
  await tx.wait();
  console.log(`Transaction hash: ${tx.hash}`);
}

async function completePhase() {
  const contractWithSigner = contract.connect(signer);
  const tx = await contractWithSigner.completePhase();
  await tx.wait();
  console.log(`Transaction hash: ${tx.hash}`);
}

async function sendFunds(toAddress, amount, purpose) {
  const contractWithSigner = contract.connect(signer);
  const tx = await contractWithSigner.sendFunds(
    toAddress,
    ethers.parseEther(amount.toString()),
    purpose
  );
  await tx.wait();
  console.log(`Transaction hash: ${tx.hash}`);
}

async function getProjectStatus() {
  const status = await contract.getProjectStatus();
  if (status) {
    const projectStatus = {
      title: status[0].toString(),
      currentPhase: status[1].toString(),
      phaseDescription: status[2].toString(),
      latestUpdate: status[3].toString(),
      balance: status[4].toString(),
      fundsReceived: status[5].toString(),
      fundsSpent: status[6].toString(),
    };
    return projectStatus;
  } else return null;
}

async function sendEtherToContract(value) {
  const tx = await signer.sendTransaction({
    to: contractAddress,
    value: ethers.parseEther(value.toString()),
  });
  await tx.wait();
  console.log(`Transaction hash: ${tx.hash}`);
}

async function getSigner() {
  await ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider.getSigner();
}

function makeTransaction(signature, args, value) {
  const transaction = { sign: signature, arg: args, val: value.toString() };
  return transaction;
}

async function getContractTransactions() {
  const logs = await provider.getLogs({
    fromBlock: 0,
    toBlock: "latest",
    address: contractAddress,
  });

  const interface = ethers.Interface.from(abi);

  const transactions = await Promise.all(
    logs.map(async (log) => await provider.getTransaction(log.transactionHash))
  );

  const transactionDetails = await Promise.all(
    transactions.map((tx) => {
      const tempInterface = interface.parseTransaction({ data: tx.data });
      return makeTransaction(
        tempInterface.signature != null
          ? tempInterface.signature.toString()
          : "",
        tempInterface.args.toString(),
        tx.value.toString()
      );
    })
  );
  return transactionDetails;
}

module.exports = {
  addManager,
  fundProject,
  updatePhase,
  completePhase,
  sendFunds,
  getProjectStatus,
  sendEtherToContract,
  getSigner,
  getContractTransactions,
};
