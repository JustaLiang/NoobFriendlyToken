var {ethers, getNamedAccounts, getUnnamedAccounts, deployments} = require('hardhat');
var { BigNumber } = require("ethers");
var { expect, assert } = require("chai");
var utils = require('ethers').utils;


describe("Ticket", function () {

  let owner, addr1, addr2;
  let tokenAdmin, ticketGenerator;

  let blockNumBefore;
  let blockBefore;
  let timestampBefore;
  let timestampEnd;

  beforeEach(async function () {

    [owner, addr1, addr2] =  await ethers.getSigners();
    await deployments.fixture();
    tokenAdmin = await ethers.getContract('NoobFriendlyTokenAdmin', owner);
    ticketGenerator = await ethers.getContract('NFTTicketGenerator', owner);

    blockNumBefore = await ethers.provider.getBlockNumber();
    blockBefore = await ethers.provider.getBlock(blockNumBefore);
    timestampBefore = blockBefore.timestamp;
    timestampEnd = timestampBefore + 86400*9

  });

    it( "NFTTicket - not enough slotting fee", async function(){
  
      const baseSettings = {
        "name" : "ticket1",
        "symbol" : "tkt",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 0,
        "maxSupply" : 100
      }
  
      await expect(
        tokenAdmin.genNFTContract(baseSettings, {value:5e11*99})
      ).to.be.revertedWith("NoobFriendlyTokenAdmin: Slotting fee error");
  
    });

    it( "NFTTicket - enough slotting fee", async function(){
  
      const baseSettings = {
        "name" : "ticket1",
        "symbol" : "tkt",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 0,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:5e11*100});
  
    });

    it( "NFTTicket - initialize only once", async function(){
  
      const baseSettings = {
        "name" : "ticket1",
        "symbol" : "tkt",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 0,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:5e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTTicket = await ethers.getContractFactory("NFTTicket");
      const ticket = NFTTicket.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await ticket.initialize("https://", timestampBefore, [30, 40, 30], [10, 20, 30] );
      await expect(
        ticket.initialize("https://", timestampBefore, [30, 40, 30], [10, 20, 30] )
      ).to.be.revertedWith("")
  
    });

    it( "NFTTicket - level error", async function(){
  
      const baseSettings = {
        "name" : "ticket1",
        "symbol" : "tkt",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 0,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:5e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTTicket = await ethers.getContractFactory("NFTTicket");
      const ticket = NFTTicket.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await expect(
        ticket.initialize("https://", timestampBefore, [30, 40, 30], [10, 20] )
      ).to.be.revertedWith("NFTTicket: level error")
  
    });

    it( "NFTTicket - sum of supply of each level not match", async function(){
  
      const baseSettings = {
        "name" : "ticket1",
        "symbol" : "tkt",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 0,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:5e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTTicket = await ethers.getContractFactory("NFTTicket");
      const ticket = NFTTicket.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await expect(
        ticket.initialize("https://", timestampBefore, [30, 100, 30], [10, 20, 30] )
      ).to.be.revertedWith("NFTTicket: sum of supply of each level not match")
  
    });

    it( "NFTTicket: no such level", async function(){
  
      const baseSettings = {
        "name" : "ticket1",
        "symbol" : "tkt",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 0,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:5e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTTicket = await ethers.getContractFactory("NFTTicket");
      const ticket = NFTTicket.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await ticket.initialize("https://", timestampBefore, [30, 40, 30], [10, 20, 30] );
      await expect(
        ticket.mintToken([0, 1, 2], [5, 5, 5])
      ).to.be.revertedWith("NFTTicket: no such level")
  
    });

    it( "NFTTicket: mintToken - sold out at this level", async function(){
  
      const baseSettings = {
        "name" : "ticket1",
        "symbol" : "tkt",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 0,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:5e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTTicket = await ethers.getContractFactory("NFTTicket");
      const ticket = NFTTicket.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await ticket.initialize("https://", timestampBefore, [30, 40, 30], [10, 20, 30] );

      for( let i = 0; i < 30; i++){
        await ticket.mintToken([0, 1, 2], [5, 5, 5], {value: 10});
      }

      await expect(
        ticket.mintToken( [0, 1, 2], [5, 5, 5], {value: 10})
      ).to.be.revertedWith("NFTTicket: sold out at this level")

      for( let i = 0; i < 40; i++){
        await ticket.mintToken( [0, 1, 2], [5, 5, 5], {value: 20});
      }

      await expect(
        ticket.mintToken( [0, 1, 2], [5, 5, 5], {value: 20})
      ).to.be.revertedWith("NFTTicket: sold out at this level")

      for( let i = 0; i < 30; i++){
        await ticket.mintToken( [0, 1, 2], [5, 5, 5], {value: 30});
      }

      await expect(
        ticket.mintToken(2, {value: 30})
      ).to.be.revertedWith("NFTTicket: sold out at this level")
  
    });

    it( "NFTTicket: mintToken - not enough for ticket price", async function(){
  
      const baseSettings = {
        "name" : "ticket1",
        "symbol" : "tkt",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 0,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:5e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTTicket = await ethers.getContractFactory("NFTTicket");
      const ticket = NFTTicket.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await ticket.initialize("https://", timestampBefore, [30, 40, 30], [10, 20, 30] );

      await expect(
        ticket.mintToken(0, {value: 10-1})
      ).to.be.revertedWith("NFTTicket: not enough for ticket price")

      await expect(
        ticket.mintToken(1, {value: 20-1})
      ).to.be.revertedWith("NFTTicket: not enough for ticket price")

      await expect(
        ticket.mintToken(2, {value: 30-1})
      ).to.be.revertedWith("NFTTicket: not enough for ticket price")
  
    });

    it( "NFTTicket: tokenURI", async function(){
  
      const baseSettings = {
        "name" : "ticket1",
        "symbol" : "tkt",
        "payees" : [addr1.address, addr2.address],
        "shares" : [1, 1],
        "typeOfNFT" : 0,
        "maxSupply" : 100
      }
  
      await tokenAdmin.genNFTContract(baseSettings, {value:5e11*100});
      const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
      const NFTTicket = await ethers.getContractFactory("NFTTicket");
      const ticket = NFTTicket.attach(contractAddr);

      // let maxSupply = await gallery.maxSupply();
      // let nowBlock = await ethers.provider.getBlockNumber();
  
      await ticket.initialize("https://", timestampBefore, [30, 40, 30], [10, 20, 30] );

      await ticket.mintToken(0, {value: 10});
      await ticket.mintToken(1, {value: 20});
      await ticket.mintToken(2, {value: 30});

      await expect(
        ticket.tokenURI(3)
      ).to.be.revertedWith("NFTTicket: query for non-existing ticket")

      const uri1 = await ticket.tokenURI(30)
      console.log("uri1: ", uri1);
      assert( uri1 === "https://1", "uri1 wrong");
  
    });



    // it( "NFTTicket - mint 3 NFT tokenURI URI query for nonexistent token", async function(){
  
    //   const baseSettings = {
    //     "name" : "ticket1",
    //     "symbol" : "tkt",
    //     "payees" : [addr1.address, addr2.address],
    //     "shares" : [1, 1],
    //     "typeOfNFT" : 0,
    //     "maxSupply" : 100
    //   }
  
    //   await tokenAdmin.genNFTContract(baseSettings, {value:1e11*100});
    //   const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
    //   const NFTGallery = await ethers.getContractFactory("NFTGallery");
    //   const gallery = NFTGallery.attach(contractAddr);

    //   // let maxSupply = await gallery.maxSupply();
    //   // let nowBlock = await ethers.provider.getBlockNumber();
  
    //   await gallery.initialize("https://", 1e11 );
      
    //   await expect(
    //     gallery.tokenURI(3)
    //   ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");

  
    // });

    // it( "NFTTicket - mint 3 NFT tokenURI success", async function(){
  
    //   const baseSettings = {
    //     "name" : "ticket1",
    //     "symbol" : "tkt",
    //     "payees" : [addr1.address, addr2.address],
    //     "shares" : [1, 1],
    //     "typeOfNFT" : 0,
    //     "maxSupply" : 100
    //   }
  
    //   await tokenAdmin.genNFTContract(baseSettings, {value:1e11*100});
    //   const contractAddr= await tokenAdmin.userContracts(owner.address, 0);
    //   const NFTGallery = await ethers.getContractFactory("NFTGallery");
    //   const gallery = NFTGallery.attach(contractAddr);

    //   // let maxSupply = await gallery.maxSupply();
    //   // let nowBlock = await ethers.provider.getBlockNumber();
  
    //   await gallery.initialize("https://", 1e11 );

    //   await gallery.mintToken([1, 3, 5], {value: 3*1e11});
      
    //   let uri = await gallery.tokenURI(3);
    //   assert( uri === "https://3");

  
    // });

});
