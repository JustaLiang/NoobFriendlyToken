const { ethers, deployments } = require('hardhat');
const { expect, assert } = require("chai");
import { utils } from "ethers";

const slottingFee = utils.parseEther("0.3");

describe("Admin", function () {

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

    await tokenAdmin.genNFTContract( baseSettings , {value: slottingFee});
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
    ).to.be.revertedWith("Admin: invalid ticket type");
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
      tokenAdmin.genNFTContract( baseSettings , {value: slottingFee.sub(100)})
    ).to.be.revertedWith("Admin: slotting fee error");

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

    await tokenAdmin.genNFTContract( baseSettings , {value: slottingFee});
  });

  
  it( "admin - getContractList", async function () {

    const contractList = await tokenAdmin.getContractList();
    await expect(
      contractList.length
    ).to.equal( 0 );
  });

  it( "admin - slottingFee", async function () {

    assert(slottingFee.eq(await tokenAdmin.slottingFee(0)) , "slottingFee 0 not right");
    assert(slottingFee.eq(await tokenAdmin.slottingFee(1)) , "slottingFee 1 not right");
    assert(slottingFee.eq(await tokenAdmin.slottingFee(2)) , "slottingFee 2 not right");

    await expect(
      tokenAdmin.slottingFee(10)
    ).to.be.revertedWith("Admin: invalid ticket type");
  });

  
  it( "admin - typeToGenerator", async function () {
    await tokenAdmin.typeToGenerator(1);
  });

});


