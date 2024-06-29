import Faucet from "./Faucet";

const NETWORK_ID = "11155111";

export default function Web3App({ connectWallet, networkCheck, account }: {account:string, networkCheck:string, connectWallet:Function}) {
   
    let content = <div>Finding Metamask...</div>;
    if (networkCheck === NETWORK_ID && account) {
        content = (
            <div>
                <Faucet />
            </div>
        );
    } else {
        content = (
            <button className="invisibleButton" onClick={() => {connectWallet()}}>
                <img className="metamaskButton w-32" src="src/assets/MetaMask_Fox.png" alt="Metamask" />
            </button>
        );
    }

    return content;
}