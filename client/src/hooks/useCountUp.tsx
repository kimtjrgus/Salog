import { useEffect, useState } from "react";

// start부터 end까지 duration동안 카운트가 진행 됨
const useCountUp = (end: number, start = 0, duration = 2000) => {
  const [count, setCount] = useState(start);
  const stepTime = Math.abs(Math.floor(duration / (end - start)));

  useEffect(() => {
    if (end <= start) return;

    let currentNumber = start;
    const counter = setInterval(() => {
      currentNumber += 1;
      setCount(currentNumber);

      if (currentNumber >= end) {
        clearInterval(counter);
      }
    }, stepTime);

    return () => {
      clearInterval(counter);
    };
  }, [end, start, stepTime]);

  return count;
};

export default useCountUp;
