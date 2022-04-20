import * as dotenv from "dotenv";
import { task } from "hardhat/config";

dotenv.config();

task("setLockTime", "Get staking amount of specific address")
  .addParam("tokenLock", "Token lock time")
  .addParam("rewardLock", "Reward lock time")
  .setAction(async (args, hre) => {
    const contractAddress = process.env.CONTRACT_ADDRESS as string;
    const stakingToken = await hre.ethers.getContractAt("DemirBank", contractAddress)

    const result = await stakingToken.setLockTime(args.tokenLock, args.rewardLock);
    console.log(result);
  });

  export default {
    solidity: "0.8.4"
  };