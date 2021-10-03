// var {ethers, getNamedAccounts, getUnnamedAccounts, deployments} = require('hardhat');
// var { BigNumber } = require("ethers");
// var { expect, assert } = require("chai");
// var utils = require('ethers').utils;


// describe("NoobFriendlyTokenAdmin.sol", function () {

//   let owner, addr1, addr2;
//   let tokenAdmin, blindboxGenerator;

//   beforeEach(async function () {

//     [owner, addr1, addr2] =  await ethers.getSigners();
//     await deployments.fixture();
//     tokenAdmin = await ethers.getContract('NoobFriendlyTokenAdmin', owner);
//     blindboxGenerator = await ethers.getContract('NFTBlindboxGenerator', owner);

//   });


//   it( "admin - updateGenerator", async function () {

//     await tokenAdmin.updateGenerator( 1 , addr1.address);

//   });

//   it( "admin - genNFTContract: invalid ticket type", async function () {

//     const baseSettings = {
//       "name" : "123",
//       "symbol" : "456",
//       "payees" : [addr1.address],
//       "shares" : [1],
//       "typeOfNFT" : 7,
//       "maxSupply" : 1
//     }

//     await expect(
//       tokenAdmin.genNFTContract( baseSettings)
//     ).to.be.revertedWith("NoobFriendlyTokenAdmin: Invalid ticket type");
//   });

//   it( "admin - genNFTContract: Slotting fee error", async function () {

//     const baseSettings = {
//       "name" : "123",
//       "symbol" : "456",
//       "payees" : [addr1.address],
//       "shares" : [1],
//       "typeOfNFT" : 1,
//       "maxSupply" : 100
//     }

//     await expect(
//       tokenAdmin.genNFTContract( baseSettings , {value:1e12})
//     ).to.be.revertedWith("NoobFriendlyTokenAdmin: Slotting fee error");

//   });

//   it( "admin - genNFTContract: success", async function () {

//     const baseSettings = {
//       "name" : "123",
//       "symbol" : "456",
//       "payees" : [addr1.address],
//       "shares" : [1],
//       "typeOfNFT" : 1,
//       "maxSupply" : 1
//     }

//     await tokenAdmin.genNFTContract( baseSettings , {value:1e12});
//   });

  
//   it( "admin - getContractList", async function () {

//     let contractList = await tokenAdmin.getContractList();
//     await expect(
//       contractList.length
//     ).to.equal( 0 );
    

//   });

//   it( "admin - slottingFee", async function () {

//     let slottingFee0 = await tokenAdmin.slottingFee(0);
//     assert( await slottingFee0.toNumber() == 5e11 , "slottingFee 0 not right");
//     let slottingFee1 = await tokenAdmin.slottingFee(1);
//     assert( await slottingFee1.toNumber() == 1e12 , "slottingFee 1 not right");

//     let slottingFee2 = await tokenAdmin.slottingFee(2);
//     assert( await slottingFee2.toNumber() == 1e11 , "slottingFee 2 not right");

//     await expect(
//       tokenAdmin.slottingFee(10)
//     ).to.be.revertedWith("NoobFriendlyTokenAdmin: generator not exists");

//   });

  
//   it( "admin - typeToGenerator", async function () {


//     let generatorInterface = await tokenAdmin.typeToGenerator( 1 );

//   });

// });

// /*======================================================================================================== */

// describe("NFTBlindBoxGenerator.sol", function () {

//   let owner, addr1, addr2;
//   let tokenAdmin, blindboxGenerator;

//   beforeEach(async function () {

//     [owner, addr1, addr2] =  await ethers.getSigners();
//     await deployments.fixture();
//     tokenAdmin = await ethers.getContract('NoobFriendlyTokenAdmin', owner);
//     blindboxGenerator = await ethers.getContract('NFTBlindboxGenerator', owner);

//   });

//   it( "NFTBlindboxGenerator", async function(){

//     assert( await blindboxGenerator.adminAddr() === tokenAdmin.address, "adminAddr equal to tokenAdmin.address");
//     let slottingFee = await blindboxGenerator.slottingFee();
//     assert( slottingFee.toNumber() === 1e12, "blindbox slotting fee not right");
    
//     const baseSettings = {
//       "name" : "123",
//       "symbol" : "456",
//       "payees" : [addr1.address],
//       "shares" : [1],
//       "typeOfNFT" : 1,
//       "maxSupply" : 1
//     }

//     await expect(
//       blindboxGenerator.genNFTContract( addr1.address, baseSettings )
//     ).to.be.revertedWith("");

//     await expect(
//       blindboxGenerator.connect(addr1).changeSlottingFee(1)
//     ).to.be.revertedWith("");

//     await blindboxGenerator.changeSlottingFee(1);
//     slottingFee = await blindboxGenerator.slottingFee();
//     assert( slottingFee.toNumber() === 1, "blindbox slotting fee equal to 1");
//   });

//   it( "NFTBlindbox - initialize", async function(){

//     const baseSettings = {
//       "name" : "123",
//       "symbol" : "456",
//       "payees" : [addr1.address],
//       "shares" : [1],
//       "typeOfNFT" : 1,
//       "maxSupply" : 100
//     }

//     await tokenAdmin.genNFTContract(baseSettings, {value:1e12*100});
//     const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
//     const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
//     const blindbox = NFTBlindbox.attach(contractAddr);

//     let maxSupply = await blindbox.maxSupply();
//     let nowBlock = await ethers.provider.getBlockNumber();

//     await blindbox.initialize("https://", 12, 1, nowBlock );
//     await expect(
//       blindbox.initialize("https://", 12, 1, nowBlock )
//     ).to.be.revertedWith("")

//   });

//   it( "NFTBlindbox - reserveNFT", async function(){

//     const baseSettings = {
//       "name" : "123",
//       "symbol" : "456",
//       "payees" : [addr1.address],
//       "shares" : [1],
//       "typeOfNFT" : 1,
//       "maxSupply" : 100
//     }

//     await tokenAdmin.genNFTContract(baseSettings, {value:1e12*100});
//     const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
//     const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
//     const blindbox = NFTBlindbox.attach(contractAddr);
//     let maxSupply = await blindbox.maxSupply();
//     let nowBlock = await ethers.provider.getBlockNumber();

//     await blindbox.initialize("https://", 12, 1, nowBlock );
//     await expect(
//       blindbox.initialize("https://", 12, 1, nowBlock )
//     ).to.be.revertedWith("")

//     await blindbox.reserveNFT();
//     let ownerBalance = await blindbox.balanceOf(owner.address);
//     assert( ownerBalance.toNumber() <= maxSupply );

//     await expect(
//       blindbox.setRevealTimestamp( nowBlock - 1 )
//     ).to.be.revertedWith("revealTimeStamp_ < block.timestamp");
// });

//   it( "NFTBlindbox - mintToken sale is not start", async function(){

//     const baseSettings = {
//       "name" : "123",
//       "symbol" : "456",
//       "payees" : [addr1.address],
//       "shares" : [1],
//       "typeOfNFT" : 1,
//       "maxSupply" : 100
//     }

//     await tokenAdmin.genNFTContract(baseSettings, {value:1e12*100});
//     const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
//     const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
//     const blindbox = NFTBlindbox.attach(contractAddr);
//     let maxSupply = await blindbox.maxSupply();
//     const blockNumBefore = await ethers.provider.getBlockNumber();
//     const blockBefore = await ethers.provider.getBlock(blockNumBefore);
//     const timestampBefore = blockBefore.timestamp;

//     await blindbox.initialize("https://", 12, 1, timestampBefore + 60 );
//     await expect(
//       blindbox.initialize("https://", 12, 1, timestampBefore + 60 )
//     ).to.be.revertedWith("")

//     await expect(
//       blindbox.connect(addr1).mintToken( 10,  {value:1*10})
//     ).to.be.revertedWith("");

//     // await blindbox.flipSaleState();
//     // await blindbox.connect(addr1).mintToken( 10,  {value:1*10});
//     // let addr1Balance = await blindbox.balanceOf(addr1.address);
//     // assert( addr1Balance.toNumber() === 10, "add1 balance should be 10" );
// });

//   it( "NFTBlindbox - tokenURI", async function(){

//     const baseSettings = {
//       "name" : "123",
//       "symbol" : "456",
//       "payees" : [addr1.address],
//       "shares" : [1],
//       "typeOfNFT" : 1,
//       "maxSupply" : 100
//     }

//     await tokenAdmin.genNFTContract(baseSettings, {value:1e12*100});
//     const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
//     const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
//     const blindbox = NFTBlindbox.attach(contractAddr);
//     let maxSupply = await blindbox.maxSupply();

//     let blockNumBefore = await ethers.provider.getBlockNumber();
//     let blockBefore = await ethers.provider.getBlock(blockNumBefore);
//     let timestampBefore = blockBefore.timestamp;
//     console.log("timestampBefore: ", timestampBefore)

//     await blindbox.initialize("https://", 12, 1, timestampBefore );

//     // blockNumBefore = await ethers.provider.getBlockNumber();
//     // blockBefore = await ethers.provider.getBlock(blockNumBefore);
//     // timestampBefore = blockBefore.timestamp;
//     // console.log("timestampAfter: ", timestampBefore)

//     await blindbox.connect(addr1).mintToken( 10,  {value:1*10});
//     let addr1Balance = await blindbox.balanceOf(addr1.address);
//     assert( addr1Balance.toNumber() === 10, "add1 balance should be 10" );
    
//     //tokenURI
//     let URI0 = await blindbox.tokenURI(0);
//     assert( URI0 ===  "https://0", "original URI equal to https://0");

//     const sevenDays = 30 * 86400;
//     await ethers.provider.send('evm_increaseTime', [sevenDays]);
//     await ethers.provider.send('evm_mine');
    
//     await blindbox.setStartingIndex();
//     URI0 = await blindbox.tokenURI(0);
//     console.log(URI0);
//     assert( URI0 !=  "https://0", "after lottery draw URI not  equal to https://0");

//   });


//   it( "NFTBlindbox - setRevealTimestamp: revealTimeStamp_ < block.timestamp", async function(){

//     const baseSettings = {
//       "name" : "123",
//       "symbol" : "456",
//       "payees" : [addr1.address],
//       "shares" : [1],
//       "typeOfNFT" : 1,
//       "maxSupply" : 100
//     }

//     await tokenAdmin.genNFTContract(baseSettings, {value:1e12*100});
//     const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
//     const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
//     const blindbox = NFTBlindbox.attach(contractAddr);
//     let maxSupply = await blindbox.maxSupply();
//     let nowBlock = await ethers.provider.getBlockNumber();

//     await blindbox.initialize("https://", 12, 1, nowBlock );
//     await expect(
//       blindbox.initialize("https://", 12, 1, nowBlock )
//     ).to.be.revertedWith("")

//     await expect(
//       blindbox.setRevealTimestamp( nowBlock )
//     ).to.be.revertedWith("revealTimeStamp_ < block.timestamp");

//   });

//   it( "NFTBlindbox - setRevealTimestamp: success", async function(){

//     const baseSettings = {
//       "name" : "123",
//       "symbol" : "456",
//       "payees" : [addr1.address],
//       "shares" : [1],
//       "typeOfNFT" : 1,
//       "maxSupply" : 100
//     }

//     await tokenAdmin.genNFTContract(baseSettings, {value:1e12*100});
//     const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
//     const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
//     const blindbox = NFTBlindbox.attach(contractAddr);
//     let maxSupply = await blindbox.maxSupply();
//     let nowBlock = await ethers.provider.getBlockNumber();

//     await blindbox.initialize("https://", 12, 1, nowBlock );
//     await expect(
//       blindbox.initialize("https://", 12, 1, nowBlock )
//     ).to.be.revertedWith("")

//     const blockNumBefore = await ethers.provider.getBlockNumber();
//     const blockBefore = await ethers.provider.getBlock(blockNumBefore);
//     const timestampBefore = blockBefore.timestamp;
//     await blindbox.setRevealTimestamp( timestampBefore + (86400 * 100) );
    
//   });


//     // console.log( bl

//     // const { expect } = require("chai");
//     // const { ethers } = require('hardhat');

//     // const sevenDays = 7 * 24 * 60 * 60;

//     // const blockNumBefore = await ethers.provider.getBlockNumber();
//     // const blockBefore = await ethers.provider.getBlock(blockNumBefore);
//     // const timestampBefore = blockBefore.timestamp;

//     // await ethers.provider.send('evm_increaseTime', [sevenDays]);
//     // await ethers.provider.send('evm_mine');

//     // const blockNumAfter = await ethers.provider.getBlockNumber();
//     // const blockAfter = await ethers.provider.getBlock(blockNumAfter);
//     // const timestampAfter = blockAfter.timestamp;

//     // expect(blockNumAfter).to.be.equal(blockNumBefore + 1);
//     // expect(timestampAfter).to.be.equal(timestampBefore + sevenDays);


// });

// describe("NoobFriendlyTokenTemplate.sol", function () {

//   let owner, addr1, addr2;
//   let tokenAdmin, blindboxGenerator;

//   beforeEach(async function () {

//     [owner, addr1, addr2] =  await ethers.getSigners();
//     await deployments.fixture();
//     tokenAdmin = await ethers.getContract('NoobFriendlyTokenAdmin', owner);
//     blindboxGenerator = await ethers.getContract('NFTBlindboxGenerator', owner);

//   });

//   it( "NoobFriendlyTokenTemplate", async function(){

//     const baseSettings = {
//       "name" : "123",
//       "symbol" : "456",
//       "payees" : [addr1.address],
//       "shares" : [1],
//       "typeOfNFT" : 1,
//       "maxSupply" : 100
//     }

//     await tokenAdmin.genNFTContract(baseSettings, {value:1e12 * 100});
//     const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
//     const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
//     const blindbox = NFTBlindbox.attach(contractAddr);

//     let settings = await blindbox.getBaseSettings();


//   });

  

// });

// describe("Gallery", function () {

//   let owner, addr1, addr2;
//   let tokenAdmin, blindboxGenerator;

//   beforeEach(async function () {

//     [owner, addr1, addr2] =  await ethers.getSigners();
//     await deployments.fixture();
//     tokenAdmin = await ethers.getContract('NoobFriendlyTokenAdmin', owner);
//     blindboxGenerator = await ethers.getContract('NFTBlindboxGenerator', owner);

//   });

//     it( "NFTGallery - not enough slotting fee", async function(){

//       assert( await blindboxGenerator.adminAddr() === tokenAdmin.address, "adminAddr equal to tokenAdmin.address");
  
//       const baseSettings = {
//         "name" : "gal",
//         "symbol" : "lery",
//         "payees" : [addr1.address, addr2.address],
//         "shares" : [1, 1],
//         "typeOfNFT" : 2,
//         "maxSupply" : 100
//       }
  
//       await expect(
//         tokenAdmin.genNFTContract(baseSettings, {value:1e11*99})
//       ).to.be.revertedWith("NoobFriendlyTokenAdmin: Slotting fee error");
  
//     });

//     it( "NFTGallery - enough slotting fee", async function(){

//       assert( await blindboxGenerator.adminAddr() === tokenAdmin.address, "adminAddr equal to tokenAdmin.address");
  
//       const baseSettings = {
//         "name" : "gal",
//         "symbol" : "lery",
//         "payees" : [addr1.address, addr2.address],
//         "shares" : [1, 1],
//         "typeOfNFT" : 2,
//         "maxSupply" : 100
//       }
  
//       await tokenAdmin.genNFTContract(baseSettings, {value:1e11*100});
  
//     });

// });
