var {ethers, getNamedAccounts, getUnnamedAccounts, deployments} = require('hardhat');
var { BigNumber } = require("ethers");
var { expect, assert } = require("chai");
var utils = require('ethers').utils;


describe("NoobFriendlyTokenTemplate.sol", function () {

  let owner, addr1, addr2;
  let tokenAdmin, blindboxGenerator;

  beforeEach(async function () {

    [owner, addr1, addr2] =  await ethers.getSigners();
    await deployments.fixture();
    tokenAdmin = await ethers.getContract('NoobFriendlyTokenAdmin', owner);
    blindboxGenerator = await ethers.getContract('NFTBlindboxGenerator', owner);

  });

  it( "NoobFriendlyTokenTemplate", async function(){

    const baseSettings = {
      "name" : "123",
      "symbol" : "456",
      "payees" : [addr1.address],
      "shares" : [1],
      "typeOfNFT" : 1,
      "maxSupply" : 100
    }

    await tokenAdmin.genNFTContract(baseSettings, {value:1e12 * 100});
    const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
    const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
    const blindbox = NFTBlindbox.attach(contractAddr);

    let settings = await blindbox.getBaseSettings();


  });

});
