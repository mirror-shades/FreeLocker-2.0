import Web3 from "web3";
import { faucetABI } from "../ABI/faucetABI";
import { useEffect, useState } from "react";

const web3 = new Web3('https://sepolia.infura.io/v3/d45000d0672e4a1c981d812465912be9');

export default  function TokenRecognizer({ tokenContractAddress } : { tokenContractAddress:string }) {
    const [name, setName] = useState("");

    const tokenContract = new web3.eth.Contract(faucetABI, tokenContractAddress);

    async function naming() {
        const _name = await tokenContract.methods.name().call();
        if(typeof(_name)==="string"){
            setName(_name);
        }
    }

    useEffect(() => {
        if (window.ethereum) {
            naming();
        }
    }, [naming]);

    return(
        <div>
            {name}{" ("}{tokenContractAddress.slice(0, 6) + "..." + tokenContractAddress.slice(-4)}{")"}
        </div>
    );
}