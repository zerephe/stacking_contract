import { Address } from "cluster";
import { ethers } from "hardhat";

async function main() {

  let lpToken: string = "0x794d9587Dd06Ea495d12F2555Da323bC1D84Eac5";
  let rewardToken: string = "0x401e64C8efA580A0ADaA6867872441245F5D1850";

  const [owner] = await ethers.getSigners()
  const DemirBank = await ethers.getContractFactory("DemirBank", owner);
  const stakingToken = await DemirBank.deploy(lpToken, rewardToken);
 
  await stakingToken.deployed();

  console.log("Deployed to:", stakingToken.address);
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export default {
  solidity: "0.8.4"
};