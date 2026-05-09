import { useState, useEffect } from 'react';

/**
 * Retarda la actualización de `value` hasta que hayan pasado `delay` ms
 * sin que cambie. Útil para no disparar efectos costosos en cada keystroke.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
