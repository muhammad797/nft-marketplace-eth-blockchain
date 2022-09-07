import { useEffect, useState } from 'react';
import { Container, Row, Form, Button } from 'react-bootstrap';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';

const Create = ({ marketplace, nft }) => {
  const [ipfsClient, setIpfsClient] = useState(null);
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const projectId = process.env.REACT_APP_INFURA_IPFS_PROJECT_ID;
    const projectSecret = process.env.REACT_APP_INFURA_IPFS_SECRET_KEY;

    const auth =
      'Basic ' +
      Buffer.from(projectId + ':' + projectSecret).toString('base64');

    const client = ipfsHttpClient({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: { authorization: auth }
    });

    setIpfsClient(client);
  }, []);

  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== 'undefined') {
      try {
        const result = await ipfsClient.add(file);
        console.log(result);
        setImage(`https://infura-ipfs.io/ipfs/${result.path}`);
      } catch (error) {
        console.log('ipfs image upload error', error);
      }
    }
  };

  const createNFT = async () => {
    if (!image || !price || !name || !description) return;

    try {
      const result = await ipfsClient.add(
        JSON.stringify({ image, name, description })
      );
      console.log('[IPFS Result 🚀]: ', { result });
      mintThenList(result);
    } catch (error) {
      console.log('IPFS URI upload error: ', error);
    }
  };

  const mintThenList = async (result) => {
    const uri = `https://infura-ipfs.io/ipfs/${result.path}`;
    try {
      // mint nft
      const r = await (await nft.mint(uri)).wait();
      console.log('Minted result: ', r);
      console.log('NFT Contract: ', nft);

      // get tokenId of new nft
      const id = await nft.tokenCount();

      // approve marketplace to spend nft
      await (await nft.setApprovalForAll(marketplace.address, true)).wait();

      // add nft to marketplace
      const listingPrice = ethers.utils.parseEther(price.toString());
      await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();

      alert('Minted, and soon will be listed.');
    } catch (err) {
      console.warn('ERROR [mintThenList 💥]: ', err);
    }
  };

  return (
    <Container className='mt-5'>
      <Row>
        <main className='col-lg-12 mx-auto' style={{ maxWidth: 1000 }}>
          <div className='content mx-auto'>
            <Row className='g-4'>
              <Form.Control
                type='file'
                name='file'
                onChange={uploadToIPFS}
                placeholder='Image'
              />
              <Form.Control
                type='text'
                name='name'
                onChange={(e) => setName(e.target.value)}
                placeholder='Name'
              />
              <Form.Control
                type='number'
                name='price'
                onChange={(e) => setPrice(e.target.value)}
                placeholder='Price'
              />
              <Form.Control
                type='text'
                name='description'
                as='textarea'
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Description'
              />
              <div className='d-grid px-0'>
                <Button onClick={createNFT} variant='primary'>
                  Create &amp; List NFTs
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </Row>
    </Container>
  );
};

export default Create;
