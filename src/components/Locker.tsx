import { Button, DatePicker } from "@nextui-org/react";
import { useState } from "react";
import { now, ZonedDateTime, getLocalTimeZone } from "@internationalized/date";

const lockerAddress = "0x58461b5A91eBE20EC0385c2dA80B4a363a20F260";

export default function Locker() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [selectedDate, setSelectedDate] = useState(now(getLocalTimeZone()));
  const [lockLength, setLockLength] = useState(0);

  const checkIfInvalid = (value: ZonedDateTime): boolean => {
    const currentTime = now(getLocalTimeZone());
    const unixTimestamp = toUnixTimestamp(selectedDate);
    return value.compare(currentTime) <= 0;
  };

  function toUnixTimestamp(value: ZonedDateTime) {
    const {
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      offset
    } = value;
  
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
    const timestamp = date.getTime() - offset;
    return timestamp;
  }

  const lockTokens = () => {
    console.log(lockLength);
  }
  
  const processDateChange = (e: ZonedDateTime) => {
    setSelectedDate(e);
    const selectedTimestamp = toUnixTimestamp(e);
    const _now = Date.now();
    const lengthOfLock = selectedTimestamp - _now;
    setLockLength(lengthOfLock);
  }
  
  return (
    <div>
      <h1>Locker</h1>
      <p>This will lock tokens for you</p>
      <input
        type="text"
        placeholder="Enter receiver address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />
      <DatePicker
        label="Event Date"
        variant="bordered"
        hideTimeZone
        showMonthAndYearPickers
        value={selectedDate}
        onChange={(e) => {processDateChange(e)}}
        isInvalid={checkIfInvalid(selectedDate)}
        errorMessage={
          selectedDate && checkIfInvalid(selectedDate)
            ? "Please enter a date at least one minute in the future."
            : undefined
        }
      />
      <Button isLoading={false} onClick={lockTokens}>Gimme!</Button>
    </div>
  );
}