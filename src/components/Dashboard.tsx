import Web3 from "web3";
import { useEffect, useState } from "react";
import { lockerABI } from "../ABI/lockerABI";
import { Accordion, AccordionItem } from "@nextui-org/react";


const web3 = new Web3('https://sepolia.infura.io/v3/d45000d0672e4a1c981d812465912be9');
const lockerAddress = "0x90B58849c7dBCB47C2F8e25Dde05Cb6FcFD69b50";
const lockerContract = new web3.eth.Contract(lockerABI, lockerAddress);

interface LockerInfo {
  owner: string;
  token: string;
  amount: bigint;
  locked: bigint;
  unlock: bigint;
}

export default function Locker({ account }: { account: any }) {
  const [userLockers, setUserLockers] = useState<LockerInfo[]>([]);

    useEffect(() => {
        checkLockers();
    }, []);

  const checkLockers = async () => {
    try {
      const lockerList: Array<number> = await lockerContract.methods.getIds(account.account).call();
      const lockers: LockerInfo[] = await Promise.all(
        lockerList.map(async (id) => await lockerContract.methods.getSafe(id).call())
      );
      setUserLockers(lockers);
    } catch (error) {
      console.error(error);
    }
  };

  
  return (
    <div>
      <div>Dashboard</div>
      <Accordion isCompact variant="shadow" selectionMode="multiple">
      {userLockers.map((locker, index) => (
        <AccordionItem key={index} aria-label={`Locker ${index + 1}`} title={`Locker ${index + 1}`}>
            <div key={index}>
            <p>Title: Locker {index + 1}</p>
            <p>Token: {locker.token}</p>
            <p>Amount: {web3.utils.fromWei(locker.amount, "ether").toString()}</p>
            <p>Lock Date: {new Date(Number(locker.locked) * 1000).toLocaleString()}</p>
            <p>Unlock Date: {new Date(Number(locker.unlock) * 1000).toLocaleString()}</p>
        </div>
        </AccordionItem>
      ))}
    </Accordion>
    </div>
  );
}