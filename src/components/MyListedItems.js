import { useEffect, useState } from "react";
import { ethers } from 'ethers'
import { Row, Col, Card, Button} from 'react-bootstrap'



function renderSoldItems(items) {
  return (
    <>
      <h2>Sold or Unlisted Items</h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <Card>
              <Card.Img variant="top" src={item.image} />
              <Card.Body color="secondary">
                Listed price: {ethers.utils.formatEther(item.totalPrice)} ETH
              </Card.Body>
              <Card.Footer>
                This item has been sold or unlisted
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}

function MyListedItems({ marketplace, nft, account}) {
  return(
    <div>
      My Listed Items page
    </div>
  )
}

export default MyListedItems;