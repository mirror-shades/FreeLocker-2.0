import Dashboard from "./Dashboard";
import Faucet from "./Faucet";
import List from "./List";
import Locker from "./Locker";

export default function Site(account:any) {
    return (
        <div>
            <h1>Welcome to the Sepolia Network</h1>
            <p>Connected Account: {account.account}</p>
            <Dashboard account={account}/>
            {/* <List />
            <Faucet account={account} />
            <Locker account={account} /> */}
        </div>
    );
};