import { Button } from "@nextui-org/react";
import { useState } from 'react';
import Web3 from 'web3';

const WalletQuery = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');

  const sendTransaction = async () => {
    try {
      const senderPrivateKey = import.meta.env.VITE_FAUCET_PRIVATE_KEY;
      
      const web3 = new Web3('https://sepolia.infura.io/v3/d45000d0672e4a1c981d812465912be9');

      if (!web3.utils.isAddress(receiverAddress)) {
        setError('Invalid receiver address.');
        return;
      }

      if (senderPrivateKey) {
        const account = web3.eth.accounts.privateKeyToAccount(senderPrivateKey);
        web3.eth.accounts.wallet.add(account);
        const gasPrice = await web3.eth.getGasPrice();
        const tx = {
          from: account.address,
          to: receiverAddress,
          value: web3.utils.toWei('0.015', 'ether'), // Ensure the value is properly converted to a string
          gas: 21000,
          gasPrice
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, senderPrivateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log(`Transaction successful with hash: ${receipt.transactionHash}`);
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  };

  return (
    <div>      
      <h3>Send ETH to Wallet</h3>
      <input
        type="text"
        placeholder="Enter receiver address"
        value={receiverAddress}
        onChange={(e) => setReceiverAddress(e.target.value)}
      />
      <Button onClick={sendTransaction}>Send Transaction</Button>
    </div>
  );
};

export default WalletQuery;