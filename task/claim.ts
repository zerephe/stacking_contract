import * as dotenv from "dotenv";
import { task } from "hardhat/config";

dotenv.config();

task("claim", "Claim reward tokens")
  .setAction(async (hre) => {
    const contractAddress = process.env.CONTRACT_ADDRESS as string;
    const stakingToken = await hre.ethers.getContractAt("DemirBank", contractAddress)

    const result = await stakingToken.claim();
    console.log(result);
  });

  export default {
    solidity: "0.8.4"
  };