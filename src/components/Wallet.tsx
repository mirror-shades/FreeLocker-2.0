import { useEffect, useState } from "react";
import Faucet from "./Faucet";

const NETWORK_ID = "11155111";
const METAMASK_DOWNLOAD_URL = "https://metamask.io/download/";

export default function Web3App({ connectWallet, networkCheck, account }: {account:string, networkCheck:string, connectWallet:Function}) {
   const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean | null>(null);

   useEffect(() => {
     const checkMetaMaskInstallation = () => {
       setIsMetaMaskInstalled(typeof window.ethereum !== 'undefined');
     };
     checkMetaMaskInstallation();
   }, []);

   let content;
   
   if (isMetaMaskInstalled === null) {
     content = <div>Checking for MetaMask...</div>;
   } else if (networkCheck === NETWORK_ID && account) {
     content = (
       <div>
         <Faucet account={account}/>
       </div>
     );
   } else {
     content = (
       <a 
         href={isMetaMaskInstalled ? "#" : METAMASK_DOWNLOAD_URL} 
         target={isMetaMaskInstalled ? "_self" : "_blank"} 
         rel={isMetaMaskInstalled ? "" : "noopener noreferrer"}
         onClick={(e) => {
           if (isMetaMaskInstalled) {
             e.preventDefault();
             connectWallet();
           }
         }}
       >
         <img className="metamaskButton w-32" src="src/assets/MetaMask_Fox.png" alt="Metamask" />
       </a>
     );
   }
   
   return content;
}