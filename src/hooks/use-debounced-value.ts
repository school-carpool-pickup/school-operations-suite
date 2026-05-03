import { useEffect, useState } from 'react';

/**
 * Tiny debounce hook — returns a value that lags behind the input by `ms`
 * milliseconds. Use to delay fetching while the user is still typing in a
 * search box.
 *
 *   const [search, setSearch] = useState('');
 *   const debounced = useDebouncedValue(search, 300);
 *   useApi(apiKeys.x.list({ search: debounced }));
 */
export function useDebouncedValue<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);

  return debounced;
}
