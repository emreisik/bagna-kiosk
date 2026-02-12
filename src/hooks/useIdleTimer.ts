import { useEffect, useState, useCallback, useRef } from 'react';

export function useIdleTimer(timeout: number = 45000) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, timeout);
  }, [timeout]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resetTimer]);

  return isIdle;
}
