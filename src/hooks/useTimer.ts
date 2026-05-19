import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimer(active: boolean, paused: boolean) {
  const [seconds, setSeconds] = useState(0);
  const started = useRef(false);

  const reset = useCallback(() => {
    setSeconds(0);
    started.current = false;
  }, []);

  useEffect(() => {
    if (!active || paused) return;
    started.current = true;
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [active, paused]);

  return { seconds, reset };
}
