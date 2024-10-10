import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  DatePicker,
} from "@nextui-org/react";
import { useState } from "react";
import Web3 from "web3";
import { now, ZonedDateTime, getLocalTimeZone } from "@internationalized/date";
import { lockerABI } from "../ABI/lockerABI";
import { faucetABI } from "../ABI/faucetABI";
import { ethers } from "ethers";
import { contractList } from "../contracts/contractList";

const web3 = new Web3(
  "https://sepolia.infura.io/v3/d45000d0672e4a1c981d812465912be9"
);
const lockerAddress = contractList.locker;
const tokenContractAddress = contractList.lockToken;
const maxApproval = web3.utils.toTwosComplement(-1);

export default function Locker(account: any) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [tokenAddress, setTokenAddress] = useState(tokenContractAddress);
  const [selectedDate, setSelectedDate] = useState(now(getLocalTimeZone()));
  const [lockAmount, setLockAmount] = useState(0);
  const [status, setStatus] = useState("");

  const sendDepositTransaction = async () => {
    try {
      await ensureAllowance();
    } catch (error) {
      console.error("Error ensuring allowance:", error);
      return;
    }

    const _now = Math.floor(Date.now() / 1000);
    const selectedTimestamp = toUnixTimestamp(selectedDate);

    const _lockLength = selectedTimestamp - _now;
    if (_lockLength <= 0) {
      console.error("Lock length must be a positive integer");
      return;
    }

    let _lockAmount;
    try {
      _lockAmount = web3.utils.toWei(String(lockAmount), "ether");
    } catch (error) {
      console.error("Error converting lock amount to Wei:", error);
      return;
    }

    const _user = account.account;

    // More debugging logs
    console.log({ _now, selectedTimestamp, _lockLength });
    console.log(_user, tokenContractAddress, _lockAmount, _lockLength);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(lockerAddress, lockerABI, signer);
      const txResponse = await contract.deposit(
        _user,
        tokenContractAddress,
        _lockAmount,
        _lockLength
      );
      const receipt = await txResponse.wait();

      if (receipt.status === 1) {
        setStatus("Transaction successful!");
      } else {
        setStatus("Transaction failed!");
      }
    } catch (error) {
      console.error(error);
      setStatus("An error occurred while sending the transaction.");
    }
  };

  async function checkAllowance() {
    const tokenContract = new web3.eth.Contract(faucetABI, tokenAddress);
    console.log(account);
    try {
      const allowance = await tokenContract.methods
        .allowance(account.account, lockerAddress)
        .call();
      return allowance;
    } catch (error) {
      console.error("Error checking allowance:", error);
      throw error;
    }
  }

  async function ensureAllowance() {
    const currentAllowance = await checkAllowance();
    var _lockAmount;

    if (typeof currentAllowance !== "bigint") {
      throw new Error(
        `Expected value of type BigInt but got ${typeof currentAllowance}`
      );
    }

    try {
      _lockAmount = web3.utils.toWei(String(lockAmount), "ether");
    } catch (error) {
      console.error("Error converting lock amount to Wei:", error);
      return;
    }
    console.log(currentAllowance);
    console.log(BigInt(_lockAmount));
    console.log(currentAllowance < BigInt(_lockAmount));
    if (currentAllowance < BigInt(_lockAmount)) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new ethers.Contract(
          tokenAddress,
          faucetABI,
          signer
        );
        const approveTransaction = await tokenContract.approve(
          lockerAddress,
          maxApproval
        );
        console.log(approveTransaction);
      } catch (error) {
        console.error("Error approving tokens:", error);
        throw error;
      }
    } else {
      console.log("Sufficient allowance already set");
    }
  }

  const checkIfInvalid = (value: ZonedDateTime): boolean => {
    const currentTime = now(getLocalTimeZone());
    return value.compare(currentTime) <= 0;
  };

  function toUnixTimestamp(value: ZonedDateTime) {
    const {
      year,
      month,
      day,
      hour = 0,
      minute = 0,
      second = 0,
      millisecond = 0,
    } = value;

    const date = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      millisecond
    );

    // Ensure that the timestamp is in UTC.
    return Math.floor(date.getTime() / 1000);
  }

  return (
    <div>
      <Button
        className="font-comfortaa w-[400px] h-[100px] text-6xl"
        variant="ghost"
        color="default"
        size="lg"
        onPress={onOpen}
      >
        Locker
      </Button>
      <Modal
        className="font-comfortaa"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>&nbsp;</ModalHeader>
              <ModalBody>
                <input
                  type="text"
                  placeholder="Enter token address"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                />
                <br />
                <input
                  type="number"
                  placeholder="Enter amount to lock"
                  value={lockAmount}
                  onChange={(e) => setLockAmount(Number(e.target.value))}
                />
                <DatePicker
                  label="Event Date"
                  variant="bordered"
                  hideTimeZone
                  showMonthAndYearPickers
                  value={selectedDate}
                  onChange={setSelectedDate}
                  isInvalid={checkIfInvalid(selectedDate)}
                  errorMessage={
                    selectedDate && checkIfInvalid(selectedDate)
                      ? "Please enter a date in the future."
                      : undefined
                  }
                />
                <Button
                  disabled={checkIfInvalid(selectedDate)}
                  isLoading={false}
                  className="text-2xl"
                  variant="light"
                  color="default"
                  onClick={sendDepositTransaction}
                >
                  Lock
                </Button>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
