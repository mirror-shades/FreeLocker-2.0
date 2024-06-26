import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const CountdownTimer = ({ targetTimestamp }) => {

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetTimestamp));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTimestamp]);

  const calculateTimeLeft = (timestamp: any) => {
    const now = dayjs();
    const target = dayjs.unix(timestamp);
    
    const diff = dayjs.duration(target.diff(now));
    
    const years = Math.floor(diff.asYears());
    const months = Math.floor(diff.asMonths() % 12);
    const days = Math.floor(diff.asDays() % 30);
    const hours = Math.floor(diff.asHours() % 24);
    const minutes = Math.floor(diff.asMinutes() % 60);
    const seconds = Math.floor(diff.asSeconds() % 60);
    const milliseconds = diff.milliseconds();

    return { years, months, days, hours, minutes, seconds, milliseconds };
  };
  
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetTimestamp));

  const formatTimeLeft = () => {
    const { years, months, days, hours, minutes, seconds, milliseconds } = timeLeft;

    if (years > 0) {
      return `${years} years, ${months} months, ${days} days`;
    } else if (months > 0) {
      return `${months} months, ${days} days, ${hours} hours`;
    } else if (days > 0) {
      return `${days} days, ${hours} hours, ${minutes} minutes`;
    } else if (hours > 0) {
      return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    } else if (minutes > 0) {
      return `${minutes} minutes, ${seconds} seconds, ${milliseconds} milliseconds`;
    } else {
      return `${seconds} seconds, ${milliseconds} milliseconds`;
    }
  };

  return (
    <div>
      <h1>Countdown Timer</h1>
      <p>{formatTimeLeft()}</p>
    </div>
  );
};

export default CountdownTimer;