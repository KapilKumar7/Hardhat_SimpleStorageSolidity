const { ethers, run, network } = require("hardhat");
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log(simpleStorage.address);
  if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
    console.log("Witing for block confirmation");
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.address, []);
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`current value is ${currentValue}`);

  const transactionResponse = await simpleStorage.store(21);
  await transactionResponse.wait(1);

  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated value is ${updatedValue}`);
}
async function verify(contractAddress, args) {
  console.log("Verifying contract..");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already verified");
    } else {
      console.log(error);
    }
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
