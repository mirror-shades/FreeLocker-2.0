import { Button } from "@nextui-org/react";
import { useState } from 'react';
import Web3 from 'web3';
import { faucetABI } from '../ABI/faucetABI.ts';
export default function Faucet() {
  const [receiverAddress, setReceiverAddress] = useState('');
  const [sending, setSending] = useState(false); 

  const faucetPublicKey = "0xf5Bcbde62Dc34457AB5a8FEB171377F22E271d08";
  const faucetPrivateKey = import.meta.env.VITE_FAUCET_PRIVATE_KEY;
  const web3 = new Web3('https://sepolia.infura.io/v3/d45000d0672e4a1c981d812465912be9');
  const tokenContractAddress = "0x5fB5f415EAe503aE390Ce5931629a8FcFe3E19C0";
  const tokenContract = new web3.eth.Contract(faucetABI, tokenContractAddress);

  const useFaucet = async () => {
    try {
      if (faucetPrivateKey) {
        console.log("attempting to send...")
        setSending(true);
        await Promise.all([dropETH(), dropToken()]);
        setSending(false);
        console.log("transaction completed")
      } else {
        console.log("issue with faucet initialization")
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
      } else {
        console.log(`Unknown error: ${JSON.stringify(error)}`);
      }
    }
  };
  
  async function dropETH() {      
    try{  
      const account = web3.eth.accounts.privateKeyToAccount(faucetPrivateKey);
      web3.eth.accounts.wallet.add(account);
      const gasPrice = await web3.eth.getGasPrice();

      // Create the transaction object
      const tx = {
        from: account.address,
        to: receiverAddress,
        value: web3.utils.toWei('0.01', 'ether'),
        gas: 21000,
        gasPrice
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, faucetPrivateKey);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);        
      console.log(`ETH tx successful with hash: ${receipt.transactionHash}`);
    } catch (error) {
      console.error('Error with eth drop:', error);
    }
  }

  async function dropToken() {
    try {
        // Prepare the transaction data
        const txData = tokenContract.methods.publicMint(receiverAddress).encodeABI();
        const nonce = await web3.eth.getTransactionCount(faucetPublicKey, 'pending');
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await tokenContract.methods.publicMint(receiverAddress).estimateGas({ from: faucetPublicKey });

        // Create the transaction object
        const tx = {
            from: faucetPublicKey,
            to: tokenContractAddress,
            gas: gasEstimate,
            gasPrice: gasPrice + BigInt(5),
            data: txData,
            nonce: nonce + BigInt(1)
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, faucetPrivateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('Token tx successful with hash:', receipt.transactionHash);
    } catch (error) {
        console.error('Error with token drop:', error);
    }
}

  return (
    <div>      
      <h1>Faucet</h1>
      <p>This faucet will provide you tokens and test ethereum</p>
      <input
        type="text"
        placeholder="Enter receiver address"
        value={receiverAddress}
        onChange={(e) => setReceiverAddress(e.target.value)}
      />
      <br/>
      <Button isLoading={sending} onClick={useFaucet}>Gimme!</Button>
    </div>
  );
};