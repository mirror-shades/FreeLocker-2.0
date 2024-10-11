import { useEffect, useState, useMemo } from "react";
import Web3 from "web3";
import { lockerABI } from "../ABI/lockerABI";
import { Accordion, AccordionItem, Button, Spinner } from "@nextui-org/react";
import Countdown from "./Countdown";
import TokenRecognizer from "./TokenRecognizer";
import { contractList } from "../contracts/contractList";

interface LockerInfo {
  owner: string;
  token: string;
  amount: bigint;
  locked: bigint;
  unlock: bigint;
}

interface FormattedLockerInfo extends LockerInfo {
  formattedAmount: string;
  lockDate: string;
  unlockDate: string;
}

export default function Dashboard({ account }: { account: string }) {
  const [userLockers, setUserLockers] = useState<LockerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const web3 = useMemo(
    () =>
      new Web3("https://sepolia.infura.io/v3/d45000d0672e4a1c981d812465912be9"),
    []
  );
  const lockerAddress = contractList.locker;
  const lockerContract = useMemo(
    () => new web3.eth.Contract(lockerABI, lockerAddress),
    [web3]
  );

  useEffect(() => {
    if (account) {
      checkLockers();
    }
  }, [account]);

  const checkLockers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const lockerList: Array<number> = await lockerContract.methods
        .getIds(account)
        .call();
      const lockers: LockerInfo[] = await Promise.all(
        lockerList.map(
          async (id) => await lockerContract.methods.getSafe(id).call()
        )
      );
      setUserLockers(lockers);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch locker information. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const formattedLockers: FormattedLockerInfo[] = useMemo(
    () =>
      userLockers.map((locker) => ({
        ...locker,
        formattedAmount: web3.utils.fromWei(locker.amount, "ether").toString(),
        lockDate: new Date(Number(locker.locked) * 1000).toLocaleString(),
        unlockDate: new Date(Number(locker.unlock) * 1000).toLocaleString(),
      })),
    [userLockers, web3]
  );

  const handleRefresh = () => {
    checkLockers();
  };

  if (!account) {
    return <p>Please connect your wallet to view your lockers.</p>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="w-[400px] bg-grey-500">
      <Button onClick={handleRefresh} disabled={isLoading}>
        Refresh
      </Button>
      <Accordion
        className="w-[400px]"
        isCompact
        variant="shadow"
        selectionMode="multiple"
        aria-label="User Lockers"
      >
        {formattedLockers.map((locker, index) => (
          <AccordionItem
            key={index}
            aria-label={`Locker ${index + 1} details`}
            title={`Locker ${index + 1}`}
          >
            <div>
              <p>
                <TokenRecognizer tokenContractAddress={locker.token} />
              </p>
              <p>Amount: {locker.formattedAmount}</p>
              <p>Lock Date: {locker.lockDate}</p>
              <p>Unlock Date: {locker.unlockDate}</p>
              <Countdown targetTimestamp={Number(locker.unlock)} />
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
