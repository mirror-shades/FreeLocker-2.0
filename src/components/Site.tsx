import Locker from "./Locker";
import Dashboard from "./Dashboard";
import Header from "./Header";
import { useCallback, useEffect, useState } from "react";

const CHAIN_NAME = "Sepolia";
const CHAIN_ID = "0xAA36A7";
const RPC_URL = "https://rpc.sepolia.dev";

export default function Site() {
  const [account, setAcc] = useState("");
  const [networkCheck, setNetworkCheck] = useState("");

  const connectWallet = useCallback(async () => {
    try {
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
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
            params: [
              {
                chainId: CHAIN_ID,
                chainName: CHAIN_NAME,
                rpcUrls: [RPC_URL],
              },
            ],
          });
        } else {
          console.error("Failed to switch/add chain:", error);
        }
      }

      const networkId = await window.ethereum.request({
        method: "net_version",
      });
      setNetworkCheck(networkId);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
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

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <Header
        connectWallet={connectWallet}
        account={account}
        networkCheck={networkCheck}
      />
      <div className="mt-8">
        <Locker account={account} />
      </div>
      <div className="mt-8">
        <Dashboard account={account} />
      </div>
    </div>
  );
}
