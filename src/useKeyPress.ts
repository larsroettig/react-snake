import { useEffect, useState } from "react";

export const useKeyPress = (targetKeyList: string[]) => {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState<boolean | string>(false);
  // If pressed key is our target key then set to true
  const downHandler = ({ key }: KeyboardEvent) => {
    if (targetKeyList.includes(key)) {
      setKeyPressed(key);
    }
  };
  // If released key is our target key then set to false
  const upHandler = ({ key }: KeyboardEvent) => {
    if (targetKeyList.includes(key)) {
      setKeyPressed(false);
    }
  };
  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount
  return keyPressed;
};
