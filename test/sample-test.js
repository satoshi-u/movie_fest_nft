const { ethers } = require("hardhat");
const { expect } = require("chai");

let masterERC;
let festMarket;
let accounts;
let provider;
let organizer;
let buyer1;
let buyer2;

before(async () => {
  provider = ethers.provider;
  accounts = await ethers.getSigners();
  organizer = accounts[0];
  buyer1 = accounts[1];
  buyer2 = accounts[2];

  const MasterERC = await ethers.getContractFactory("MasterERC");
  masterERC = await MasterERC.deploy("base_uri");
  await masterERC.deployed();

  const FestMarket = await ethers.getContractFactory("FestMarket");
  festMarket = await FestMarket.deploy(masterERC.address);
  await festMarket.deployed();
});

describe("settlemint_fest primary market", function () {
  it("mints currency token correctly to fest market address", async function () {
    let tx = await festMarket.connect(organizer).mintCurrencyToken("1000000");
    await tx.wait();
    let currencyTokenId = await festMarket._currencyTokenId();
    let balanceWeiFestMarket = await masterERC.balanceOf(
      festMarket.address,
      currencyTokenId
    );
    let balanceTokenFestMarket = ethers.utils.formatUnits(balanceWeiFestMarket);
    // console.log("token balance @festMarket: ", balanceTokenFestMarket);
    expect(balanceTokenFestMarket).to.equal(
      "1000000.0",
      "incorrect balance for currency token after mint!"
    );
  });

  it("buys currency token correctly to buyer1 & buyer2 and pays eth to organizer", async function () {
    const costWeiToken = ethers.utils.parseUnits("100");
    // console.log("costWeiToken: ", costWeiToken);
    // 10 ether for 100 currency tokens as per price
    let tx = await festMarket
      .connect(buyer1)
      .buyCurrencyToken(costWeiToken, { value: ethers.utils.parseEther("10") });
    await tx.wait();
    let currencyTokenId = await festMarket._currencyTokenId();
    let balanceWeiBuyer1 = await masterERC.balanceOf(
      buyer1.address,
      currencyTokenId
    );
    let balanceTokenBuyer1 = ethers.utils.formatUnits(balanceWeiBuyer1);
    // console.log("token balance @buyer1: ", balanceTokenBuyer1);
    expect(balanceTokenBuyer1).to.equal(
      "100.0",
      "incorrect tokens for buyer1 after buying!!"
    );
    let balanceWeiOrganizer = await provider.getBalance(organizer.address);
    let balanceEthOrganizer = ethers.utils.formatUnits(balanceWeiOrganizer);
    // console.log(`eth balance @organizer: ${balanceEthOrganizer} ETH`);
    // console.log(parseInt(balanceEthOrganizer));
    // expect(BigNumber.from(100)).to.be.within(BigNumber.from(99), BigNumber.from(101));
    // parseFloat underFlow : TODO
    expect(ethers.BigNumber.from(parseInt(balanceEthOrganizer))).to.be.within(
      ethers.BigNumber.from("10009"),
      ethers.BigNumber.from("10010"),
      "100 currency token cost{10 eth} sent to organizer!!"
    );
    // transfer to buyer2 also, to be used later -> 100 tokens, pay 10eth more to organizer
    tx = await festMarket
      .connect(buyer2)
      .buyCurrencyToken(costWeiToken, { value: ethers.utils.parseEther("10") });
    await tx.wait();
  });

  it("buys fest tickets{primary market} for buyer1 by paying currencyTokens to market contract", async function () {
    // first approve the market contract so transfers can take place via contract
    let tx = await masterERC
      .connect(buyer1)
      .setApprovalForAll(festMarket.address, true);
    await tx.wait();
    tx = await masterERC
      .connect(buyer2)
      .setApprovalForAll(festMarket.address, true);
    await tx.wait();
    // check for approval TODO later, now buy 10 nfts with buyer1
    tx = await festMarket.connect(buyer1).buyFestTicket(10);
    await tx.wait();
    //
    let currencyTokenId = await festMarket._currencyTokenId();
    let balanceWeiBuyer1 = await masterERC.balanceOf(
      buyer1.address,
      currencyTokenId
    );
    let balanceTokenBuyer1 = ethers.utils.formatUnits(balanceWeiBuyer1);
    // console.log("token balance @buyer1: ", balanceTokenBuyer1);
    expect(balanceTokenBuyer1).to.equal(
      "90.0",
      "incorrect currencyTokens for buyer1 after buying NFTs!!"
    );
    let nftId = await festMarket._nftId();
    let balanceNFTBuyer1 = await masterERC.balanceOf(buyer1.address, nftId);
    // console.log("nft balance @buyer1: ", balanceNFTBuyer1);
    expect(balanceNFTBuyer1.toString()).to.equal(
      "10",
      "incorrect NFTs for buyer1 after buying NFTs!!"
    );
    let ticketsSold = await festMarket._ticketsSold();
    expect(ticketsSold).to.equal(10, "_ticketsSold should be 1!");
  });
});

describe("settlemint_fest secondary market", function () {
  it("lists ticket for sale(less than 10% hike) by buyer1 in the secondary market with listing fee", async function () {
    // first approve the market contract so transfers can take place via contract
    // Already done previously!
    // buy 10 nfts with buyer1
    let nftId = await festMarket._nftId();
    const priceWeiToken = ethers.utils.parseUnits("1.1"); // max hike 1.1
    tx = await festMarket
      .connect(buyer1)
      .listTicketForSale(nftId, priceWeiToken, {
        value: ethers.utils.parseEther("0.025"),
      });
    await tx.wait();
    // check ticketIds incremented by 1
    let ticketIds = await festMarket._ticketIds();
    expect(ticketIds).to.equal(
      1,
      "_ticketIds should be 1 after listing for sale!"
    );
    // check _ticketIdTtoFestTicket TODO
    //check nft balance of buyer1
    let balanceNFTBuyer1 = await masterERC.balanceOf(buyer1.address, nftId);
    // console.log("nft balance @buyer1: ", balanceNFTBuyer1);
    expect(balanceNFTBuyer1.toString()).to.equal(
      "9",
      "incorrect NFTs for buyer1 after listing 1 NFT for sale!!"
    );
    //check nft balance of market contract
    let balanceNFTFestMarket = await masterERC.balanceOf(
      festMarket.address,
      nftId
    );
    // console.log("nft balance @festMarket: ", balanceNFTFestMarket);
    expect(balanceNFTFestMarket.toString()).to.equal(
      "1",
      "incorrect NFTs for festMarket after buyer1 lists 1 NFT for sale!!"
    );
    let balanceWeiFestMarket = await provider.getBalance(festMarket.address);
    let balanceEthFestMarket = ethers.utils.formatUnits(balanceWeiFestMarket);
    // console.log(`eth balance @festMarket: ${balanceEthFestMarket} ETH`);
    // console.log(parseFloat(balanceEthFestMarket));
    expect(balanceEthFestMarket.toString()).to.equal(
      "0.025",
      "listing fee not received by festMarket!"
    );
  });

  it("buyer2 buys ticket listed for sale by buyer1 in the secondary market & listing fee sent to organizer", async function () {
    // first approve the market contract so transfers can take place via contract
    // Already done previously!
    // only 1 ticket listed for sale for first tiem, so _ticketIds returns 1
    let ticketId = await festMarket._ticketIds();
    tx = await festMarket.connect(buyer2).buyTicketOnSale(ticketId);
    await tx.wait();
    // 100 tokens, buyer2 had, now 98.9 -> 10.1 to buy listed for
    // check _ticketIdTtoFestTicket TODO
    //check nft balance of buyer2
    let nftId = await festMarket._nftId();
    let balanceNFTBuyer2 = await masterERC.balanceOf(buyer2.address, nftId);
    // console.log("nft balance @buyer2: ", balanceNFTBuyer2);
    expect(balanceNFTBuyer2.toString()).to.equal(
      "1",
      "incorrect NFTs for buyer2 after buying 1 NFT listed for sale!!"
    );
    //check nft balance of market contract -> 0
    let balanceNFTFestMarket = await masterERC.balanceOf(
      festMarket.address,
      nftId
    );
    // console.log("nft balance @festMarket: ", balanceNFTFestMarket);
    expect(balanceNFTFestMarket.toString()).to.equal(
      "0",
      "incorrect NFTs for festMarket after buyer2 buys 1 NFT lisetd for sale!!"
    );
    // token balance of buyer1
    let currencyTokenId = await festMarket._currencyTokenId();
    let balanceWeiBuyer1 = await masterERC.balanceOf(
      buyer1.address,
      currencyTokenId
    );
    let balanceTokenBuyer1 = ethers.utils.formatUnits(balanceWeiBuyer1);
    // console.log("token balance @buyer1: ", balanceTokenBuyer1);
    expect(balanceTokenBuyer1).to.equal(
      "91.1",
      "incorrect tokens for buyer1 after selling in secondary market!!"
    );
    // token balance of buyer2
    let balanceWeiBuyer2 = await masterERC.balanceOf(
      buyer2.address,
      currencyTokenId
    );
    let balanceTokenBuyer2 = ethers.utils.formatUnits(balanceWeiBuyer2);
    // console.log("token balance @buyer2: ", balanceTokenBuyer2);
    expect(balanceTokenBuyer2).to.equal(
      "98.9",
      "incorrect tokens for buyer2 after buying in secondary market!!"
    );
    // listing fee to organizer
    let balanceWeiOrganizer = await provider.getBalance(organizer.address);
    let balanceEthOrganizer = ethers.utils.formatUnits(balanceWeiOrganizer);
    // console.log(`eth balance @organizer: ${balanceEthOrganizer} ETH`);
    // console.log(parseFloat(balanceEthOrganizer));
    expect(ethers.BigNumber.from(parseInt(balanceEthOrganizer))).to.be.within(
      ethers.BigNumber.from("10020"),
      ethers.BigNumber.from("10021"),
      "listing fee not sent to organizer!!"
    );
  });

  it("gets nft tickets circulating(sold/unsold) in secondary market", async function () {
    let items = await festMarket.fetchFestTicketsInSecondaryMarket();
    // console.log("total items: ", items.length);
    expect(items.length).to.equal(1, "incorrect n{items} in 2nd market!");
  });
});
