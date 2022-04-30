import { useState, useEffect } from "react";
import { ethers } from 'ethers'
import { Row, Col, Card, Button} from 'react-bootstrap'

//marketplace: fetch contract, nft: fetch nfts metadata from ipfs
const Home = ({ marketplace, nft }) =>{

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    const loadMarketplaceItems = async () =>{
        //Load all unsold items
        const itemCount = await marketplace.itemCount()
        let items = []
        for(let i =1; i <= itemCount; i++){
            const item = await marketplace.items(i)
            if(!item.sold) {
                //Get uri url from nft contract
                const uri = await nft.tokenURI(item.tokenId)
                //get total price of item(price+fee)
                const totalPrice = await marketplace.getTotalPrice(item.itemId)
                //Adds item to items array 
                items.push({
                    totalPrice,
                    itemId: item.itemId,
                    seller: item.seller,
                    uri: uri
                })
            }
        }
        setLoading(false)
        setItems(items)
    }

    const buyMarketItem = async (item) => {
      //Waits for transaction to confirm
      await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
      loadMarketplaceItems()
    }

    useEffect(() =>{
      loadMarketplaceItems()
      setLoading(false)
    },[])

    if (loading) return(
        <main style={{padding:"lrem 0"}}>
            <h2>Loading...</h2>
        </main>
    )
    
    return(
        <div className="flex justify-center">
            {items.length > 0 ?
            <div className="px-5 container">
            <Row xs={1} md={2} lg={4} className="g-4 py-5">
                {items.map((item, idx) => (
                <Col key={idx} className="overflow-hidden">
                  <Card>
                    <Card.Body>
                      <Card.Title>{item.id}</Card.Title>
                      <Card.Text>
                        {item.uri}
                      </Card.Text>
                      <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                ))}
            </Row>
            </div>
            : (
            <main style={{ padding: "1rem 0" }}>
                <h2>No listed assets</h2>
            </main>
            )}
        </div>
    )
}

export default Home