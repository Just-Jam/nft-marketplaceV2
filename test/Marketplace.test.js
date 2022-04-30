const {expect} = require("chai");

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe('NFTMarketplace', function(){
    let addrs
    let feePercent = 1
    let uri = "randomurl.something"

    before(async function(){
        const NFT = await ethers.getContractFactory("TestNFT")
        const Marketplace = await ethers.getContractFactory("MarketplaceV2")

        addrs = await ethers.getSigners()

        nft = await NFT.deploy();
        marketplace = await Marketplace.deploy(feePercent);

        await marketplace.connect(addrs[0]).approveCollection(nft.address);
    })

    it("Should be able to list and unlist items", async function(){
        await nft.connect(addrs[1]).mint(uri);
        await nft.connect(addrs[1]).setApprovalForAll(marketplace.address, true) 
        const receipt = await marketplace.connect(addrs[1]).listItem(nft.address, 1, toWei(100))
        expect(await marketplace.getTotalPrice(1)).to.equal(toWei(101));

        const itemCount = await marketplace.itemCount();
        expect(itemCount).to.equal(1);
    })

})