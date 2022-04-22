import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("DemirBank staking", function () {

  let stakeInstance: Contract;
  let lpToken: Contract;
  let tokenVLC: Contract;

  let addrBank: SignerWithAddress[];
  let zeroAddress: String = ethers.constants.AddressZero;
  
  beforeEach(async function(){
    // Getting ContractFactory and Signers

    const Token0 = await ethers.getContractFactory("VolkovCoin");
    lpToken = await Token0.deploy("UniV2", "LP");
    await lpToken.deployed();

    const Token1 = await ethers.getContractFactory("VolkovCoin");
    tokenVLC = await Token1.deploy("VolkovToken", "VLC");
    await tokenVLC.deployed();

    const Token = await ethers.getContractFactory("DemirBank");
    addrBank = await ethers.getSigners();
    stakeInstance = await Token.deploy(lpToken.address, tokenVLC.address);
    await stakeInstance.deployed();
  });

  describe("Deploy", function(){
    it("Should return proper token addresses on deploy", async function() {
      expect(await stakeInstance.stakeToken()).to.eq(lpToken.address);
      expect(await stakeInstance.rewardToken()).to.eq(tokenVLC.address);
    });

    it("Should have default reward coef values", async function() {
      expect(await stakeInstance.rewardCo()).to.eq(25);
      expect(await stakeInstance.rewardLockTime()).to.eq(10);
      expect(await stakeInstance.tokenLockTime()).to.eq(20);
    });
  });

  describe("Txs", function() {
    it("Should have new reward set", async function() {
      await stakeInstance.setReward(50);
      expect(await stakeInstance.rewardCo()).to.eq(50);
    });

    it("Should be reverted with too high reward", async function() {
      await expect(stakeInstance.setReward(200)).to.be.revertedWith("Too high reward mf!");
    });

    it("Should be reverted with min token locktime is 1", async function() {
      await expect(stakeInstance.setLockTime(0, 0)).to.be.revertedWith("Min token locktime is 1 mf!");
    });

    it("Should be reverted with min reward locktime is higher", async function() {
      await expect(stakeInstance.setLockTime(1, 0)).to.be.revertedWith("Min reward locktime is higher mf!");
    });

    it("Should be some staked tokens", async function() {
      await lpToken._mint(addrBank[0].address, 1000);
      await lpToken.approve(stakeInstance.address, 1000);
      
      //stake some tokens
      await stakeInstance.stake(1000);

      expect(await stakeInstance.getStakeAmount(addrBank[0].address)).to.eq(1000);
      expect(await lpToken.balanceOf(stakeInstance.address)).to.eq(1000);
    });

    it("Should be able to unstake and then claim", async function() {
      await lpToken._mint(addrBank[0].address, 1000);
      await lpToken.approve(stakeInstance.address, 1000);
      
      //stake some tokens
      await stakeInstance.stake(1000);
      expect(await stakeInstance.getStakeAmount(addrBank[0].address)).to.eq(1000);
      await stakeInstance.setLockTime(1, 2);

      //mint some reward tokens
      await tokenVLC._mint(stakeInstance.address, 10000);

      await new Promise(resolve => setTimeout(resolve, 2000));

      //unstake and check
      await stakeInstance.unstake();
      expect(await stakeInstance.getStakeAmount(addrBank[0].address)).to.eq(0);
    });
    
    it("Should be able to claim and then unstake", async function() {
      await lpToken._mint(addrBank[0].address, 1000);
      await lpToken.approve(stakeInstance.address, 1000);
      
      //stake some tokens
      await stakeInstance.stake(1000);
      expect(await stakeInstance.getStakeAmount(addrBank[0].address)).to.eq(1000);
      await stakeInstance.setLockTime(1, 2);

      //mint some reward tokens
      await tokenVLC._mint(stakeInstance.address, 10000);

      await new Promise(resolve => setTimeout(resolve, 2000));

      //unstake and check
      await stakeInstance.claim();
      await stakeInstance.unstake();
      expect(await stakeInstance.getStakeAmount(addrBank[0].address)).to.eq(0);
    });

    it("Should be claimable", async function() {
      await lpToken._mint(addrBank[0].address, 1000);
      await lpToken.approve(stakeInstance.address, 1000);
      
      //stake some tokens
      await stakeInstance.stake(1000);
      expect(await stakeInstance.getStakeAmount(addrBank[0].address)).to.eq(1000);
      await stakeInstance.setLockTime(1, 2);
      await stakeInstance.setReward(50);

      //mint some reward tokens
      await tokenVLC._mint(stakeInstance.address, 10000);

      await new Promise(resolve => setTimeout(resolve, 2000));

      //claim and check
      await stakeInstance.claim();
      expect(await tokenVLC.balanceOf(addrBank[0].address)).to.eq(500);
    });

    it("Should revert with too soon to unstake", async function() {
      await lpToken._mint(addrBank[0].address, 1000);
      await lpToken.approve(stakeInstance.address, 1000);
      
      //stake some tokens
      await stakeInstance.stake(1000);
      expect(await stakeInstance.getStakeAmount(addrBank[0].address)).to.eq(1000);

      //unstake and check
      await expect(stakeInstance.unstake()).to.be.revertedWith("Too soon to unstake mf!");
    });

    it("Should revert with nothing to unstake", async function() {
      await stakeInstance.setLockTime(1, 2);

      await new Promise(resolve => setTimeout(resolve, 2000));

      await expect(stakeInstance.unstake()).to.be.revertedWith("Nothing to unstake mf!");
    });

    it("Should revert with too soon to claim", async function() {
      await lpToken._mint(addrBank[0].address, 1000);
      await lpToken.approve(stakeInstance.address, 1000);
      
      await stakeInstance.stake(1000);
      expect(await stakeInstance.getStakeAmount(addrBank[0].address)).to.eq(1000);

      await expect(stakeInstance.claim()).to.be.revertedWith("Too soon to claim reward mf!");
    });

    it("Should revert if not a staker", async function() {
      await stakeInstance.setLockTime(1, 2);

      await new Promise(resolve => setTimeout(resolve, 2000));

      await expect(stakeInstance.claim()).to.be.revertedWith("You are not a staker mf!");
    });

    it("Should revert with nothing to claim", async function() {
      await lpToken._mint(addrBank[0].address, 1000);
      await lpToken.approve(stakeInstance.address, 1000);
      
      await stakeInstance.stake(1000);
      expect(await stakeInstance.getStakeAmount(addrBank[0].address)).to.eq(1000);
      await stakeInstance.setLockTime(1, 2);
      await tokenVLC._mint(stakeInstance.address, 10000);

      await new Promise(resolve => setTimeout(resolve, 2000));

      await stakeInstance.claim();

      await expect(stakeInstance.claim()).to.be.revertedWith("Nothing to claim mf!");
    });
  });
});