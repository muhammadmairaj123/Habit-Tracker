import { useEffect, useState } from 'react';
import { getTodayKey } from '../utils/dates.js';

/**
 * Returns today's date key ("YYYY-MM-DD") and updates it when the day changes.
 *
 * Without this, a tab left open overnight would keep showing yesterday as
 * "today", and clicking "done" would record the wrong date. We re-check every
 * 30 seconds and whenever the tab becomes visible or focused again (timers are
 * throttled in background tabs, so those events cover the "laptop was asleep" case).
 * If the date hasn't changed, setToday receives an identical string and React
 * skips the re-render.
 */
export default function useToday() {
  const [today, setToday] = useState(getTodayKey);

  useEffect(() => {
    const refresh = () => setToday(getTodayKey());
    const intervalId = setInterval(refresh, 30_000);

    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return today;
}
