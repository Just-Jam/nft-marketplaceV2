import { useEffect, useState } from "react";
import { BigNumber, ethers } from 'ethers'
import { Row, Form, Button, Card} from 'react-bootstrap'

const toWei = (num) => ethers.utils.parseEther(num.toString())

const Create = ({ marketplace, nft, account }) =>{

  const [nfts, setNFTs] = useState([])
  const [loading, setLoading] = useState(true)

  const mintNFT = async () =>{
    const uri = "Hallo"
    await(await nft.mint(uri)).wait()
  }

  const approveNFT = async () =>{
    await (await nft.setApprovalForAll(marketplace.address, true)).wait()
  }

  const listNFT = async (nft) =>{
    const id = BigNumber.from(nft.id)
    console.log(id)
    await(await marketplace.listItem(nft.address, id, toWei(10))).wait()
  }

  const getNFTData = async () =>{
    const count = await nft.tokenCount()
    let nfts = []
    for(let i =1; i <= count.toNumber(); i++){
      let owner = await nft.ownerOf(i)
      if(owner.toUpperCase() == account.toUpperCase()){
        const uri = await nft.tokenURI(i)

        nfts.push({
          uri: uri,
          tokenID: i,
          contract: nft.address
        })
      } 
    }
    setNFTs(nfts)
    setLoading(false)
  }
  
  useEffect(() => {
    if(loading) {
      getNFTData()
      console.log(nfts)
    }
  },[account, nfts])

  return(
    <div className="container-fluid mt-5">
      <Button onClick={mintNFT}>Mint nft</Button>
      <br></br>
      <div className="container">
        <ul>
          {nfts.map(nft => (
            <Card key={nft.tokenID}>
              ID: {nft.tokenID}
              <Card.Body>
                <Card.Text>
                  URI: {nft.uri}
                </Card.Text>
                Address: {nft.contract}
              </Card.Body>
              <Button onClick={approveNFT}>Approve NFT</Button>
              <Button onClick={() => listNFT(nft)}>List NFT</Button>
            </Card>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Create;