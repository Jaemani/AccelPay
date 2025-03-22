'use client';

import React, { useState, useContext, useRef } from 'react';
import { Client } from 'xrpl';
import { Web3Context } from '@/app/context/Web3Context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle, Image, Upload } from 'lucide-react';

// Mock NFT contract ABI (you'd use a real one)
const NFT_CONTRACT_ABI = [
  "function mint(address to, string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)"
];
const NFT_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Example address

const NFTIssuePage = () => {
  const { account, signer, connected, connect } = useContext(Web3Context);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [attributes, setAttributes] = useState([{ trait_type: '', value: '' }]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [mintedTokenId, setMintedTokenId] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttributeChange = (index, key, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][key] = value;
    setAttributes(newAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  const removeAttribute = (index) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
  };

  const uploadToIPFS = async () => {
    // This is a mock function - in a real app, you'd use IPFS or another storage solution
    return `https://ipfs.example.com/image/${Date.now()}`;
  };

  const createMetadata = async (imageUrl) => {
    // Create metadata object
    const metadata = {
      name,
      description,
      image: imageUrl,
      attributes: attributes.filter(attr => attr.trait_type && attr.value)
    };
    
    // In a real app, you'd upload this to IPFS
    // For this example, we'll just mock the URL
    return `https://ipfs.example.com/metadata/${Date.now()}`;
  };

  const mintNFT = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      await connect();
      return;
    }

    if (!name || !description || !imageFile) {
      setStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: 'info', message: 'Uploading image to IPFS...' });
      
      // Mock uploading to IPFS (in real app you'd use a service like Pinata)
      const imageUrl = await uploadToIPFS();
      
      setStatus({ type: 'info', message: 'Creating metadata...' });
      const metadataUrl = await createMetadata(imageUrl);
      
      setStatus({ type: 'info', message: 'Minting NFT...' });
      
      // Create contract instance
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      
      // Mint NFT
      const tx = await nftContract.mint(account, metadataUrl);
      await tx.wait();
      
      // Get token ID from event logs (simplified)
      setMintedTokenId(123); // In a real app, extract from event
      
      setStatus({ type: 'success', message: 'NFT minted successfully!' });
    } catch (error) {
      console.error('Minting error:', error);
      setStatus({ type: 'error', message: error.message || 'Failed to mint NFT' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
        Create New NFT
      </h1>
      
      <Card className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-xl">
        <form onSubmit={mintNFT}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name*</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="NFT Name"
                  className="w-full bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description*</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your NFT..."
                  className="w-full bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 h-32"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Attributes</label>
                {attributes.map((attr, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      type="text"
                      value={attr.trait_type}
                      onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                      placeholder="Trait name"
                      className="w-1/2 bg-gray-700 border border-gray-600"
                    />
                    <Input
                      type="text"
                      value={attr.value}
                      onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="w-1/2 bg-gray-700 border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="px-2 py-1 bg-red-600 rounded-lg text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAttribute}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                >
                  + Add Attribute
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Image*</label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 h-64 flex flex-col items-center justify-center cursor-pointer ${
                  previewUrl ? 'border-blue-500' : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => fileInputRef.current.click()}
              >
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewUrl}
                      alt="NFT preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-400">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, SVG (max 10MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 font-medium rounded-lg py-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                {status?.message || 'Processing...'}
              </>
            ) : connected ? (
              'Mint NFT'
            ) : (
              'Connect Wallet'
            )}
          </Button>
          
          {status && status.type !== 'info' && (
            <div className={`mt-4 p-3 rounded-lg ${
              status.type === 'error' ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'
            }`}>
              <div className="flex items-center">
                {status.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                <p>{status.message}</p>
              </div>
              
              {mintedTokenId && (
                <div className="mt-2 p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-300">NFT Token ID: #{mintedTokenId}</p>
                  <a 
                    href={`https://opensea.io/assets/${NFT_CONTRACT_ADDRESS}/${mintedTokenId}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm mt-1 block"
                  >
                    View on OpenSea
                  </a>
                </div>
              )}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default NFTIssuePage;