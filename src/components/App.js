import './App.css';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'
import { Spinner } from 'react-bootstrap'

import MarketplaceAbi from '../contractsData/MarketplaceV2.json'
import MarketplaceAddress from '../contractsData/MarketplaceV2-address.json'
import NftAbi from '../contractsData/TestNFT.json';
import NftAddress from '../contractsData/TestNFT-address.json';
import Navigation from './Navbar';
import Home from './Home';
import Create from './Create';
import MyListedItems from './MyListedItems';

function App() {

  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [marketplace, setMarketplace] = useState({})
  const [marketplaceRead, setMarketplaceRead] = useState({})
  const [nft, setNFT] = useState({})

  const provider = new ethers.providers.Web3Provider(window.ethereum)

  //Metamask login/connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    // Set signer
    const signer = provider.getSigner()

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await web3Handler()
    })
    loadContracts(signer)
  }

  const loadContracts = async (signer) => {
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    setMarketplace(marketplace)

    const nft = new ethers.Contract(NftAddress.address, NftAbi.abi, signer)
    setNFT(nft);

    // const feeAccount = await marketplace.feeAccount()
    // console.log("feeAccount: ", feeAccount)

    // const nftName = await nft.name()
    // console.log("nftName: ", nftName)
    setLoading(false)
  }

  const loadContractsWOSigner = async () => {
    const marketplaceRead = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, provider)
    setMarketplaceRead(marketplaceRead)
    
  }

  useEffect(() => {
    
  },[])

  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navigation web3Handler={web3Handler} account={account} />
        </>
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home marketplace={marketplace} nft={nft} />
              } />
              <Route path="/create" element={
                <Create marketplace={marketplace} nft={nft} account={account} />
              } />
              <Route path="/my-listed-items" element={
                <MyListedItems marketplace={marketplace} nft={nft} account={account}/>
              } />
              
              {/* <Route path="/my-purchases" element={
                <MyPurchases marketplace={marketplace} nft={nft} account={account}/>
              } /> */}
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
