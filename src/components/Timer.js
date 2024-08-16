import { useState, useEffect } from "react";
import moment from "moment";

export default function Timer({ initialTime, onPause, onTimeEnd }) {
  const [time, setTime] = useState(initialTime * 60);

  useEffect(() => {
    if (onPause || time <= 0) return;

    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          onTimeEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [time, onPause, onTimeEnd]);

  useEffect(() => {
    const handleTimeControlChange = () => {
      setTime(initialTime * 60);
    };

    window.addEventListener('timeResetEvent', handleTimeControlChange);

    return () => {
      window.removeEventListener('timeResetEvent', handleTimeControlChange);
    };
  }, []);

  const formattedTime = moment.utc(time * 1000).format('mm:ss');

  return (
    <div className="p-2 w-16 flex justify-center place-items-center bg-white text-black font-bold rounded-md">
      {formattedTime}
    </div>
  )
}
