import { useState, useEffect } from "react";
import moment from "moment";

export default function Timer({ initialTime, onPause, onTimeOut }) {
  const [time, setTime] = useState(initialTime * 60);

  useEffect(() => {
    if (onPause || time <= 0) return;

    const interval = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          onTimeOut();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [time, onPause, onTimeOut]);

  const formattedTime = moment.utc(time * 1000).format('mm:ss');

  return (
    <div className="p-2 w-16 flex justify-center place-items-center bg-white text-black font-bold rounded-md">
      {formattedTime}
    </div>
  )
}
