import Web3 from "web3";
import { useEffect, useState } from "react";
import { lockerABI } from "../ABI/lockerABI";
import { Accordion, AccordionItem } from "@nextui-org/react";
import CountdownTimer from "./Countdown";
import Countdown from "./Countdown";
import TokenRecognizer from "./TokenRecognizer";
import { contractList } from "../contracts/contractList";


const web3 = new Web3('https://sepolia.infura.io/v3/d45000d0672e4a1c981d812465912be9');
const lockerAddress = contractList.locker;
const lockerContract = new web3.eth.Contract(lockerABI, lockerAddress);

interface LockerInfo {
  owner: string;
  token: string;
  amount: bigint;
  locked: bigint;
  unlock: bigint;
}

export default function Dashboard({ account }: { account: any }) {
  const [userLockers, setUserLockers] = useState<LockerInfo[]>([]);
    useEffect(() => {
        checkLockers();
    }, []);

  const checkLockers = async () => {
    try {
      const lockerList: Array<number> = await lockerContract.methods.getIds(account).call();
      const lockers: LockerInfo[] = await Promise.all(
        lockerList.map(async (id) => await lockerContract.methods.getSafe(id).call())
      );
      setUserLockers(lockers);
    } catch (error) {
      console.error(error);
    }
  };



  if(account){
  console.log(web3.utils.isAddress(account))
  console.log(web3.utils.isAddress(contractList.locker))
  return (
    <div className="w-[400px] h-[400px] bg-grey-500">
      <Accordion className="w-[400px]" isCompact variant="shadow" selectionMode="multiple">
        {userLockers.map((locker, index) => (
          <AccordionItem key={index} aria-label={`Locker ${index + 1}`} title={`Locker ${index + 1}`}>
              <div key={index}>
              <p> <TokenRecognizer tokenContractAddress={locker.token} /></p>
              <p>Amount: {web3.utils.fromWei(locker.amount, "ether").toString()}</p>
              <p>Lock Date: {new Date(Number(locker.locked) * 1000).toLocaleString()}</p>
              <p>Unlock Date: {new Date(Number(locker.unlock) * 1000).toLocaleString()}</p>
              <Countdown targetTimestamp={Number(locker.unlock)} />
          </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
    );
  }
}