var {ethers, getNamedAccounts, getUnnamedAccounts, deployments} = require('hardhat');
var { BigNumber } = require("ethers");
var { expect, assert } = require("chai");
var utils = require('ethers').utils;


describe("NFTBlindBoxGenerator.sol", function () {

  let owner, addr1, addr2;
  let tokenAdmin, blindboxGenerator;

  let blockNumBefore;
  let blockBefore;
  let timestampBefore;
  let timestampEnd;

  beforeEach(async function () {

    [owner, addr1, addr2] =  await ethers.getSigners();
    await deployments.fixture();
    tokenAdmin = await ethers.getContract('NoobFriendlyTokenAdmin', owner);
    blindboxGenerator = await ethers.getContract('NFTBlindboxGenerator', owner);

    blockNumBefore = await ethers.provider.getBlockNumber();
    blockBefore = await ethers.provider.getBlock(blockNumBefore);
    timestampBefore = blockBefore.timestamp;
    timestampEnd = timestampBefore + 86400*9



  });

  it( "NFTBlindboxGenerator", async function(){

    assert( await blindboxGenerator.adminAddr() === tokenAdmin.address, "adminAddr equal to tokenAdmin.address");
    let slottingFee = await blindboxGenerator.slottingFee();
    assert( slottingFee.toNumber() === 1e12, "blindbox slotting fee not right");
    
    const baseSettings = {
      "name" : "123",
      "symbol" : "456",
      "payees" : [addr1.address],
      "shares" : [1],
      "typeOfNFT" : 1,
      "maxSupply" : 1
    }

    await expect(
      blindboxGenerator.genNFTContract( addr1.address, baseSettings )
    ).to.be.revertedWith("");

    await expect(
      blindboxGenerator.connect(addr1).changeSlottingFee(1)
    ).to.be.revertedWith("");

    await blindboxGenerator.changeSlottingFee(1);
    slottingFee = await blindboxGenerator.slottingFee();
    assert( slottingFee.toNumber() === 1, "blindbox slotting fee equal to 1");
  });

  it( "NFTBlindbox - initialize", async function(){

    const baseSettings = {
      "name" : "123",
      "symbol" : "456",
      "payees" : [addr1.address],
      "shares" : [1],
      "typeOfNFT" : 1,
      "maxSupply" : 100
    }

    await tokenAdmin.genNFTContract(baseSettings, {value:1e12*100});
    const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
    const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
    const blindbox = NFTBlindbox.attach(contractAddr);

    let maxSupply = await blindbox.maxSupply();


    await blindbox.initialize("https://", 12, 1, timestampBefore, timestampEnd );
    const _baseURI = await blindbox.baseURI()
    const _maxPurchase = await blindbox.maxPurchase()
    const _tokenPrice = await blindbox.tokenPrice()
    const _timestampBefore = await blindbox.saleStart()
    const _timestampEnd = await blindbox.revealTimeStamp()

    assert( _baseURI === "https://", "baseURI not right" )
    assert( _maxPurchase.toString() === '12', "maxPurchase not right" )
    assert( _tokenPrice.toString() === "1", "tokenPrice not right" )
    assert( _timestampBefore.toString() === timestampBefore.toString(), "saleStart not right" )
    assert( _timestampEnd.toString() === timestampEnd.toString(), "revealTimeStamp not right" )

    await expect(
      blindbox.initialize("https://", 12, 1, timestampBefore, timestampEnd )
    ).to.be.revertedWith("")

  });

  it( "NFTBlindbox - reserveNFT", async function(){

    const baseSettings = {
      "name" : "123",
      "symbol" : "456",
      "payees" : [addr1.address],
      "shares" : [1],
      "typeOfNFT" : 1,
      "maxSupply" : 100
    }

    await tokenAdmin.genNFTContract(baseSettings, {value:1e12*100});
    const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
    const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
    const blindbox = NFTBlindbox.attach(contractAddr);
    let maxSupply = await blindbox.maxSupply();
    let nowBlock = await ethers.provider.getBlockNumber();

    await blindbox.initialize("https://", 12, 1, timestampBefore + 60, timestampEnd );
    await expect(
      blindbox.initialize("https://", 12, 1, timestampBefore, timestampEnd )
    ).to.be.revertedWith("")

    await expect( 
      blindbox.reserveNFT(20)
    ).to.emit(blindbox, "Transfer")
    .withArgs(ethers.constants.AddressZero, owner.address, 1)


    let ownerBalance = await blindbox.balanceOf(owner.address);
    assert( ownerBalance.toNumber() <= maxSupply );

});

  it( "NFTBlindbox - mintToken sale is not start", async function(){

    const baseSettings = {
      "name" : "123",
      "symbol" : "456",
      "payees" : [addr1.address],
      "shares" : [1],
      "typeOfNFT" : 1,
      "maxSupply" : 100
    }

    await tokenAdmin.genNFTContract(baseSettings, {value:1e12*100});
    const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
    const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
    const blindbox = NFTBlindbox.attach(contractAddr);
    let maxSupply = await blindbox.maxSupply();

    await blindbox.initialize("https://", 12, 1, timestampBefore + 60, timestampEnd );
    await expect(
      blindbox.initialize("https://", 12, 1, timestampBefore + 60, timestampEnd )
    ).to.be.revertedWith("")

    await expect(
      blindbox.connect(addr1).mintToken( 10,  {value:1*10})
    ).to.be.revertedWith("");

    // await blindbox.flipSaleState();
    // await blindbox.connect(addr1).mintToken( 10,  {value:1*10});
    // let addr1Balance = await blindbox.balanceOf(addr1.address);
    // assert( addr1Balance.toNumber() === 10, "add1 balance should be 10" );
});

  it( "NFTBlindbox - tokenURI", async function(){

    const baseSettings = {
      "name" : "123",
      "symbol" : "456",
      "payees" : [addr1.address],
      "shares" : [1],
      "typeOfNFT" : 1,
      "maxSupply" : 100
    }

    await tokenAdmin.genNFTContract(baseSettings, {value:1e12*100});
    const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
    const NFTBlindbox = await ethers.getContractFactory("NFTBlindbox");
    const blindbox = NFTBlindbox.attach(contractAddr);
    let maxSupply = await blindbox.maxSupply();

    await blindbox.initialize("https://", 12, 1, timestampBefore, timestampEnd );

    await expect(
      blindbox.connect(addr1).mintToken( 10,  {value:1*10})
    ).to.emit(blindbox, "Transfer")
    .withArgs(ethers.constants.AddressZero, owner.address, 1)
    .and.to.emit(blindbox, "Transfer")
    .withArgs(owner.address, addr1.address, 1)

    
    //tokenURI
    let _maxSupply = await blindbox.maxSupply();
    let URI0 = await blindbox.tokenURI(0);
    assert( URI0 ===  "https://"+_maxSupply.toString(), "original URI equal to https:// + maxSupply");

    const sevenDays = 30 * 86400;
    await ethers.provider.send('evm_increaseTime', [sevenDays]);
    await ethers.provider.send('evm_mine');
    
    await blindbox.reveal();
    URI0 = await blindbox.tokenURI(0);
    console.log("new URI: ", URI0);

  });


});

