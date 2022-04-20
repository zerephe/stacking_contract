import * as dotenv from "dotenv";
import { task } from "hardhat/config";

dotenv.config();

task("getStakeAmount", "Get staking amount of specific address")
  .addParam("owner", "Token owner address")
  .setAction(async (args, hre) => {
    const contractAddress = process.env.CONTRACT_ADDRESS as string;
    const stakingToken = await hre.ethers.getContractAt("DemirBank", contractAddress)

    const result = await stakingToken.getStakeAmount(args.owner);
    console.log(result);
  });

  export default {
    solidity: "0.8.4"
  };