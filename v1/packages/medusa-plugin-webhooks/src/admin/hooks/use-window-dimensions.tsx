import { useEffect, useState } from "react";

// @ts-ignore
const window = typeof window !== "undefined" ? window : {};

export const useWindowDimensions = () => {
  if (typeof window === "undefined") {
    return {
      height: 0,
      width: 0,
    };
  }

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return dimensions;
};
