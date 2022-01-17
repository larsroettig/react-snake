import React from "react";

export const useInterval: any = (
  callback: (...args: any[]) => any,
  delay: number
) => {
  const intervalRef = React.useRef(0);
  const savedCallback = React.useRef(callback);
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  React.useEffect(() => {
    const tick = () => savedCallback.current();
    intervalRef.current = window.setInterval(tick, delay);
    return () => window.clearInterval(intervalRef.current);
  }, [delay]);
  return intervalRef;
};
