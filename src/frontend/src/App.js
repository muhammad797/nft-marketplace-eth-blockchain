import './App.css';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './Navigation';

import Home from '../pages/Home';
import Create from '../pages/Create';
import MyListedItems from '../pages/MyListedItems';
import MyPurchases from '../pages/MyPurchases';

import { ethers } from 'ethers';
import MarketplaceAddress from '../contractsData/Marketplace-address.json';
import MarketplaceAbi from '../contractsData/Marketplace.json';
import NFTAddress from '../contractsData/NFT-address.json';
import NFTAbi from '../contractsData/NFT.json';

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [NFT, setNFT] = useState(null);
 
  // Connect/Login to MetaMask
  const web3Handler = async () => {
    try {
      // Fetch all the accounts provided to our web app from Metamask
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(accounts[0]);

      // Get provider from MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Get signer
      const signer = provider.getSigner();

      // load the contracts
      loadContracts(signer);
    } catch (err) {
      alert(err.message);
    }
  };

  const loadContracts = async (signer) => {
    // fetch marketplace contract
    const marketplace = new ethers.Contract(
      MarketplaceAddress.address,
      MarketplaceAbi.abi,
      signer
    );
    setMarketplace(marketplace);

    // fetch NFT contract
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    setNFT(nft);

    // Stop loading
    setLoading(false);
  };

  return (
    <BrowserRouter>
      <div className='App'>
        <Navigation web3Handler={web3Handler} account={account} />
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '80vh'
            }}
          >
            <Spinner animation='border' style={{ display: 'flex' }} />
            <p className='mx-3 my-0'>Waiting for MetaMask connection</p>
          </div>
        ) : (
          <>
            <Routes>
              <Route
                path='/'
                element={<Home marketplace={marketplace} nft={NFT} />}
              />
              <Route
                path='/create'
                element={<Create marketplace={marketplace} nft={NFT} />}
              />
              <Route path='/my-listed-items' element={<MyListedItems />} />
              <Route path='/my-purchases' element={<MyPurchases />} />
            </Routes>
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
