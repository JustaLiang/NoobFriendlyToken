var {ethers, getNamedAccounts, getUnnamedAccounts, deployments} = require('hardhat');
var { BigNumber } = require("ethers");
var { expect, assert } = require("chai");
var utils = require('ethers').utils;


describe("Gallery", function () {

  let owner, addr1, addr2;
  let tokenAdmin, blindboxGenerator;

  beforeEach(async function () {

    [owner, addr1, addr2] =  await ethers.getSigners();
    await deployments.fixture();
    tokenAdmin = await ethers.getContract('NoobFriendlyTokenAdmin', owner);
    blindboxGenerator = await ethers.getContract('NFTBlindboxGenerator', owner);

  });

    it( "NFTGallery - not enough slotting fee", async function(){

      assert( await blindboxGenerator.adminAddr() === tokenAdmin.address, "adminAddr equal to tokenAdmin.address");
  
      const baseSettings = {
        "name" : "gal",
        "symbol" : "lery",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 2,
        "maxSupply" : 100
      }
  
      await expect(
        tokenAdmin.genNFTContract(baseSettings, {value:1e11*99})
      ).to.be.revertedWith("NoobFriendlyTokenAdmin: Slotting fee error");
  
    });

    it( "NFTGallery - enough slotting fee", async function(){

      assert( await blindboxGenerator.adminAddr() === tokenAdmin.address, "adminAddr equal to tokenAdmin.address");
  
      const baseSettings = {
        "name" : "gal",
        "symbol" : "lery",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 2,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:1e11*100});
  
    });

});
