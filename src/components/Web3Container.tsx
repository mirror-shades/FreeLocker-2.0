import { useState, useEffect, useCallback } from "react";
import Site from "./Site";

const CHAIN_NAME = "Sepolia";
const CHAIN_ID = "0xAA36A7";
const NETWORK_ID = "11155111";
const RPC_URL = "https://rpc.sepolia.dev";

export default function App() {
    const [account, setAcc] = useState("");
    const [networkCheck, setNetworkCheck] = useState("");

    const connectWallet = useCallback(async () => {
        try {
            const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
            if (account) setAcc(account);

            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: CHAIN_ID }], 
                });
            } catch (error: any) {
                if (error.code === 4902) {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{
                            chainId: CHAIN_ID,
                            chainName: CHAIN_NAME,
                            rpcUrls: [RPC_URL],
                        }],
                    });
                } else {
                    console.error("Failed to switch/add chain:", error);
                }
            }

            const networkId = await window.ethereum.request({ method: "net_version" });
            setNetworkCheck(networkId);

        } catch (error) {
            console.error("Failed to connect wallet:", error);
        }
    }, []);

    const checkConnection = useCallback(async () => {
        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0) {
                setAcc(accounts[0]);
                await connectWallet();
            }
        } catch (error) {
            console.error("Failed to check connection:", error);
        }
    }, [connectWallet]);

    useEffect(() => {
        if (window.ethereum) {
            checkConnection();
        }
    }, [checkConnection]);

    let content = <div>Finding Metamask...</div>;
    if (networkCheck === NETWORK_ID && account) {
        content = (
            <div className="centered">
                <Site account={account}/>
            </div>
        );
    } else {
        content = (
            <button className="invisibleButton" onClick={connectWallet}>
                <img className="metamaskButton" src="src/assets/MetaMask_Fox.png" alt="Metamask" />
            </button>
        );
    }

    return content;
}