import hre from "hardhat";
import { Artifact } from "hardhat/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { PolkastarterToken } from "../typechain/PolkastarterToken";
import { RewardToken } from "../typechain/RewardToken";
import { PolsStake } from "../typechain/PolsStake";

import { Signers } from "../types";
import { basicTests } from "./PolsStake.basicTests";

// https://ethereum-waffle.readthedocs.io
const { deployContract } = hre.waffle;

// https://docs.ethers.io/v5/api/utils/bignumber/
// const { BigNumber } = hre.ethers;

// const DECIMALS = 18;
// const DECMULBN = BigNumber.from(10).pow(DECIMALS);

const PERIOD_HARDHAT = 24 * 60 * 60; // 1 day (simulated time periods) on hardhat
const PERIOD_BLOCKCHAIN = 60; // 1 minute on "real" blockchains
const timePeriod = hre.network.name == "hardhat" ? PERIOD_HARDHAT : PERIOD_BLOCKCHAIN;

describe("PolsStake", function () {
  before(async function () {
    if (hre.network.name != "hardhat") this.timeout(60 * 60 * 1000); // 1 h timeout for real blockchain

    this.signers = {} as Signers;
    const signers: SignerWithAddress[] = await hre.ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.user1 = signers[1];
    this.signers.user2 = signers[2];
    // });

    // describe("deploy contracts", function () {
    // beforeEach(async function () {
    // deploy stake token and mint initial token to deployer (this.signers.admin)
    const stakeTokenArtifact: Artifact = await hre.artifacts.readArtifact("PolkastarterToken");
    this.stakeToken = <PolkastarterToken>(
      await deployContract(this.signers.admin, stakeTokenArtifact, [this.signers.admin.address])
    );
    await this.stakeToken.deployed();
    console.log("stakeToken     deployed to :", this.stakeToken.address);

    // deploy reward token
    const rewardTokenArtifact: Artifact = await hre.artifacts.readArtifact("RewardToken");
    this.rewardToken = <RewardToken>await deployContract(this.signers.admin, rewardTokenArtifact, []);
    await this.rewardToken.deployed();
    console.log("rewardToken    deployed to :", this.rewardToken.address);

    // deploy staking contract
    const stakeArtifact: Artifact = await hre.artifacts.readArtifact("PolsStake");
    this.stake = <PolsStake>(
      await deployContract(this.signers.admin, stakeArtifact, [this.stakeToken.address, 14 * timePeriod])
    );
    await this.stake.deployed();
    console.log("stake contract deployed to :", this.stake.address);
  });

  basicTests(timePeriod);

  // scenario_1();

  // scenario_2():
  // });
});
