import { useEffect, useState } from 'react';

/**
 * Like useState, but the value is saved to localStorage and restored on load.
 *
 * - Reads once, lazily, on first render (the function passed to useState only runs once).
 * - Writes whenever the value changes.
 * - Every storage call is wrapped in try/catch, because localStorage can throw
 *   (private browsing, storage full, blocked by browser settings) and a habit
 *   tracker should keep working in memory rather than crash.
 *
 * `initialValue` may be a plain value or a function that returns one.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw);
    } catch {
      // Corrupted JSON or storage unavailable: fall through to the default.
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Could not save (storage full or blocked). The app keeps working for this session.
    }
  }, [key, value]);

  return [value, setValue];
}
