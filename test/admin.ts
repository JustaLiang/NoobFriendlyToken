var {ethers, getNamedAccounts, getUnnamedAccounts, deployments} = require('hardhat');
var { BigNumber } = require("ethers");
var { expect, assert } = require("chai");
var utils = require('ethers').utils;

describe("NoobFriendlyTokenAdmin.sol", function () {

  let owner, addr1, addr2;
  let tokenAdmin, ticketGenerator, blindboxGenerator, galleryGenerator;

  beforeEach(async function () {

    [owner, addr1, addr2] =  await ethers.getSigners();
    await deployments.fixture();
    tokenAdmin = await ethers.getContract('NoobFriendlyTokenAdmin', owner);
    ticketGenerator = await ethers.getContract('NFTTicketGenerator', owner);
    blindboxGenerator = await ethers.getContract('NFTBlindboxGenerator', owner);
    galleryGenerator = await ethers.getContract('NFTGalleryGenerator', owner);

  });

  it( "NoobFriendlyTokenGenerator - genNFTContract", async function () {

    const baseSettings = {
      "name" : "ticket1",
      "symbol" : "tkt",
      "payees" : [addr1.address, addr2.address],
      "shares" : [1, 1],
      "typeOfNFT" : 0,
      "maxSupply" : 100
    }

    await tokenAdmin.genNFTContract( baseSettings , {value:5e11*100});

  });


  it( "admin - updateGenerator", async function () {

    await tokenAdmin.updateGenerator( 1 , addr1.address);

  });

  it( "admin - genNFTContract: invalid ticket type", async function () {

    const baseSettings = {
      "name" : "123",
      "symbol" : "456",
      "payees" : [addr1.address],
      "shares" : [1],
      "typeOfNFT" : 7,
      "maxSupply" : 1
    }

    await expect(
      tokenAdmin.genNFTContract( baseSettings)
    ).to.be.revertedWith("NoobFriendlyTokenAdmin: Invalid ticket type");
  });

  it( "admin - genNFTContract: Slotting fee error", async function () {

    const baseSettings = {
      "name" : "123",
      "symbol" : "456",
      "payees" : [addr1.address],
      "shares" : [1],
      "typeOfNFT" : 1,
      "maxSupply" : 100
    }

    await expect(
      tokenAdmin.genNFTContract( baseSettings , {value:1e12})
    ).to.be.revertedWith("NoobFriendlyTokenAdmin: Slotting fee error");

  });

  it( "admin - genNFTContract: success", async function () {

    const baseSettings = {
      "name" : "123",
      "symbol" : "456",
      "payees" : [addr1.address],
      "shares" : [1],
      "typeOfNFT" : 1,
      "maxSupply" : 1
    }

    await tokenAdmin.genNFTContract( baseSettings , {value:1e12});
  });

  
  it( "admin - getContractList", async function () {

    let contractList = await tokenAdmin.getContractList();
    await expect(
      contractList.length
    ).to.equal( 0 );
    

  });

  it( "admin - slottingFee", async function () {

    let slottingFee0 = await tokenAdmin.slottingFee(0);
    assert( await slottingFee0.toNumber() == 5e11 , "slottingFee 0 not right");
    let slottingFee1 = await tokenAdmin.slottingFee(1);
    assert( await slottingFee1.toNumber() == 1e12 , "slottingFee 1 not right");

    let slottingFee2 = await tokenAdmin.slottingFee(2);
    assert( await slottingFee2.toNumber() == 1e11 , "slottingFee 2 not right");

    await expect(
      tokenAdmin.slottingFee(10)
    ).to.be.revertedWith("NoobFriendlyTokenAdmin: generator not exists");

  });

  
  it( "admin - typeToGenerator", async function () {


    let generatorInterface = await tokenAdmin.typeToGenerator( 1 );

  });

});


