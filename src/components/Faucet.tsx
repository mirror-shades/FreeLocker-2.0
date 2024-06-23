import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure} from "@nextui-org/react";
import { useState } from 'react';
import Web3 from 'web3';
import { faucetABI } from '../ABI/faucetABI.ts';

export default function Faucet(account:any) {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
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
      const faucetObject = web3.eth.accounts.privateKeyToAccount(faucetPrivateKey);
      web3.eth.accounts.wallet.add(faucetObject);
      const gasPrice = await web3.eth.getGasPrice();
      const gasEstimate = await tokenContract.methods.publicMint(account.account.account).estimateGas({ from: faucetPublicKey });

      //Create the transaction object
      const tx = {
        from: faucetObject.address,
        to: account.account.account,
        value: web3.utils.toWei('0.01', 'ether'),
        gas: gasEstimate,
        gasPrice: String(gasPrice) + 50
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
        const txData = tokenContract.methods.publicMint(account.account.account).encodeABI();
        
        // Fetch the nonce, gas price, and gas estimate
        const nonce = await web3.eth.getTransactionCount(faucetPublicKey, 'pending');
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await tokenContract.methods.publicMint(account.account.account).estimateGas({ from: faucetPublicKey });

        // Create the transaction object
        const tx = {
            from: faucetPublicKey,
            to: tokenContractAddress,
            gas: gasEstimate,
            gasPrice: String(gasPrice) + 50,  // Add a small increment for faster processing
            data: txData,
            nonce: nonce + BigInt(1)
        };

        // Sign and send the transaction
        const signedTx = await web3.eth.accounts.signTransaction(tx, faucetPrivateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        console.log('Token tx successful with hash:', receipt.transactionHash);
    } catch (error) {
        console.error('Error with token drop:', error);
    }
}


  return (
    <>
      <Button color="primary" onPress={onOpen}>Open Modal</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={true}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Faucet</ModalHeader>
              <ModalBody>
                <p> 
                  This will airdrop both tokens and Sepolia Ethereum to your wallet.
                  This will let you test the platform even if you don't have any funds
                  on the testnet! 
                  Have fun.
                </p>
                <br/>
                <Button isLoading={sending} color="primary" onClick={useFaucet}>Gimme!</Button>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
