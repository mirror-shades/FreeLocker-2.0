import { Button, DatePicker } from "@nextui-org/react";
import { useState } from "react";
import Web3 from "web3";
import { now, ZonedDateTime, getLocalTimeZone } from "@internationalized/date";
import { lockerABI } from "../ABI/lockerABI";
import { faucetABI } from "../ABI/faucetABI";
import { ethers } from 'ethers';

const web3 = new Web3('https://sepolia.infura.io/v3/d45000d0672e4a1c981d812465912be9');
const lockerAddress = "0x58461b5A91eBE20EC0385c2dA80B4a363a20F260";
const tokenContractAddress = "0x5fB5f415EAe503aE390Ce5931629a8FcFe3E19C0";
const lockerContract = new web3.eth.Contract(lockerABI, lockerAddress);

export default function Locker(account:any) {
  const [tokenAddress, setTokenAddress] = useState(tokenContractAddress);
  const [selectedDate, setSelectedDate] = useState(now(getLocalTimeZone()));
  const [lockAmount, setLockAmount] = useState(0);
  const [status, setStatus] = useState('');

  const sendDepositTransaction = async () => {
    try {
      await ensureAllowance();
    } catch (error) {
      console.error('Error ensuring allowance:', error);
      return;
    }
  
    const _now = Math.floor(Date.now() / 1000);
    const selectedTimestamp = toUnixTimestamp(selectedDate);

  
    const _lockLength = selectedTimestamp - _now;
    if (_lockLength <= 0) {
      console.error('Lock length must be a positive integer');
      return;
    }
  
    let _lockAmount;
    try {
      _lockAmount = web3.utils.toWei(String(lockAmount), "ether");
    } catch (error) {
      console.error('Error converting lock amount to Wei:', error);
      return;
    }
  
    const _user = account.account.account;
  
    // More debugging logs
    console.log({ _now, selectedTimestamp, _lockLength });
    console.log(_user, tokenContractAddress, _lockAmount, _lockLength);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(lockerAddress, lockerABI, signer);
      const txResponse = await contract.deposit(_user, tokenContractAddress, _lockAmount, _lockLength);
      const receipt = await txResponse.wait();

      if (receipt.status === 1) {
        setStatus('Transaction successful!');
      } else {
        setStatus('Transaction failed!');
      }
    } catch (error) {
      console.error(error);
      setStatus('An error occurred while sending the transaction.');
    }
  };




  async function checkAllowance() {
    const tokenContract = new web3.eth.Contract(faucetABI, tokenAddress);
    
    try {
        const allowance = await tokenContract.methods.allowance(account.account.account, lockerAddress).call();
        return(allowance);
    } catch (error) {
        console.error("Error checking allowance:", error);
        throw error;
    }
}

async function ensureAllowance() {
  const currentAllowance = await checkAllowance();
  var _lockAmount;

  if (typeof currentAllowance !== 'bigint') {
      throw new Error(`Expected value of type BigInt but got ${typeof currentAllowance}`);
  }

  try {
    _lockAmount = web3.utils.toWei(String(lockAmount), "ether");
  } catch (error) {
    console.error('Error converting lock amount to Wei:', error);
    return;
  }
console.log(currentAllowance)
console.log(BigInt(_lockAmount))
console.log(currentAllowance < BigInt(_lockAmount))
  if (currentAllowance < BigInt(_lockAmount)) {
      try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const tokenContract = new ethers.Contract(tokenAddress, faucetABI, signer);
          const approveTransaction = await tokenContract.approve(lockerAddress, _lockAmount);
          console.log(approveTransaction)
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
      millisecond = 0
    } = value;

    const date = new Date(year, month - 1, day, hour, minute, second, millisecond);

    // Ensure that the timestamp is in UTC.
    return Math.floor(date.getTime() / 1000);
  }
  
  return (
    <div>
      <h1>Locker</h1>
      <p>This will lock tokens for you</p>
      <input
        type="text"
        placeholder="Enter token address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />
      <br/>
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
      <Button color="primary" disabled={checkIfInvalid(selectedDate)} isLoading={false} onClick={sendDepositTransaction}>Lock!</Button>
    </div>
  );
}