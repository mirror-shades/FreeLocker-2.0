import Faucet from "./Faucet";
import Locker from "./Locker";

export default function Site(account:any) {
    console.log(account)
    return (
        <div>
            <h1>Welcome to the Sepolia Network</h1>
            <p>Connected Account: {account.account}</p>
            <Faucet account={account} />
            <Locker account={account} />
        </div>
    );
};