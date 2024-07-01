import { Spacer } from "@nextui-org/react";
import "../assets/DESIGNER.otf";
import Wallet from "./Wallet";

export default function Header({ connectWallet, networkCheck, account }: {account:string, networkCheck:string, connectWallet:Function}) {
  const Logo = () => {
    return (
      <div>
        <h1 className="font-designer text-right font text-9xl">
          TEST
          <br />
          LOCKER
        </h1>
      </div>
    );
  };
  return (
    <div>
      <div className="flex items-center">
        <Logo />
        <Spacer x={16} />
        <Wallet connectWallet={connectWallet} networkCheck={networkCheck} account={account} />
      </div>
    </div>
  );
}