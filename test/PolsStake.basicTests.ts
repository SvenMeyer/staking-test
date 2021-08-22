import hre from "hardhat";

// https://www.chaijs.com/guide/styles/#expect
// https://www.chaijs.com/api/bdd/
// https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
import { expect } from "chai";
// import { doesNotMatch } from "assert";
import { BigNumberish } from "ethers";

// https://docs.ethers.io/v5/api/utils/bignumber/
const { BigNumber } = hre.ethers;

const DECIMALS = 18;
const DECMULBN = BigNumber.from(10).pow(DECIMALS);
const stakeAmount = DECMULBN.mul(1000); // 1000 token

let stakeTokenDecimals: number;
let rewardTokenDecimals: number;

export function basicTests(timePeriod: number): void {
  console.log("timePeriod =", timePeriod, "seconds");

  const stakeRewardFactor = 5 * timePeriod * 1000;

  let userClaimableRewards_contract: BigNumberish;

  describe("basicTests", function () {
    it("stake token should have 18 decimals", async function () {
      stakeTokenDecimals = await this.stakeToken.decimals();
      expect(stakeTokenDecimals).to.equal(DECIMALS);
    });

    it("reward token should have 18 decimals", async function () {
      rewardTokenDecimals = await this.rewardToken.decimals();
      expect(rewardTokenDecimals).to.equal(DECIMALS);
    });

    it("send stake token from admin account to user1 account", async function () {
      const amount = "10000" + "0".repeat(18);
      await this.stakeToken.connect(this.signers.admin).transfer(this.signers.user1.address, amount);
      const balance = await this.stakeToken.balanceOf(this.signers.user1.address);
      console.log("user1 : stakeToken balance = ", hre.ethers.utils.formatUnits(balance, stakeTokenDecimals));
      expect(balance).to.equal(amount);
    });

    it("user1 should have some stake tokens", async function () {
      const amount = "10000" + "0".repeat(18);
      // no transfer of stake token to user1 here
      const balance = await this.stakeToken.balanceOf(this.signers.user1.address);
      console.log("user1 : stakeToken balance = ", hre.ethers.utils.formatUnits(balance, stakeTokenDecimals));
      expect(balance).to.equal(amount);
    });

    it("deploy a reward token and mint some token to admin account", async function () {
      const balance = await this.rewardToken.balanceOf(this.signers.admin.address);
      console.log("reward token balance of admin =", hre.ethers.utils.formatUnits(balance, rewardTokenDecimals));
      expect(balance).to.gte(hre.ethers.utils.parseUnits("1000.0", rewardTokenDecimals));
    });

    it("user1 should have no rewards token", async function () {
      const balance = await this.rewardToken.balanceOf(this.signers.user1.address);
      console.log("reward token balance of user1 = ", balance.toString());
      expect(balance).to.equal(0);
    });

    it("send 1000 reward tokens from admin account to staking contract", async function () {
      const amount = hre.ethers.utils.parseUnits("1000.0", rewardTokenDecimals);
      await this.rewardToken.connect(this.signers.admin).transfer(this.stake.address, amount);
      const balance = await this.rewardToken.balanceOf(this.stake.address);
      console.log(
        "staking contract reward token balance = ",
        hre.ethers.utils.formatUnits(balance, rewardTokenDecimals),
      );
      expect(balance).to.equal(amount);
    });

    it("decrease lock time period - setLockTimePeriod()", async function () {
      const lockTimePeriod = await this.stake.lockTimePeriod();
      const oneWeek = 7 * timePeriod;
      console.log("current lockTimePeriod =", lockTimePeriod);
      console.log("new     lockTimePeriod =", oneWeek);
      await this.stake.connect(this.signers.admin).setLockTimePeriod(oneWeek);
      const result = await this.stake.lockTimePeriod();
      console.log("lockTimePeriod (seconds) = ", result.toString());
      expect(result).to.equal(oneWeek);
    });

    it("increase lock time period - setLockTimePeriod() - should revert", async function () {
      await expect(this.stake.connect(this.signers.admin).setLockTimePeriod(14 * timePeriod)).to.be.reverted;
    });

    it("setRewardToken()", async function () {
      await this.stake.connect(this.signers.admin).setRewardToken(this.rewardToken.address);
      const rewardToken_address = await this.stake.rewardToken();
      console.log("this.stake.rewardToken() = ", rewardToken_address);
      expect(rewardToken_address).to.equal(this.rewardToken.address);
    });

    it("setStakeRewardFactor()", async function () {
      await this.stake.connect(this.signers.admin).setStakeRewardFactor(stakeRewardFactor);
      const result = await this.stake.stakeRewardFactor();
      console.log("stakeRewardFactor = ", result.toString());
      expect(result).to.equal(stakeRewardFactor);
    });
  });
}
