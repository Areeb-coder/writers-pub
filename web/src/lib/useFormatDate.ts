import { useEffect, useState } from 'react';

/**
 * Hook to safely format dates on client-side only
 * Avoids hydration errors by not rendering formatted date during SSR
 */
export function useFormattedDate(dateString: string): string {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    try {
      const date = new Date(dateString);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      const year = date.getFullYear();
      setFormatted(`${month} ${day}, ${year}`);
    } catch {
      setFormatted('Unknown date');
    }
  }, [dateString]);

  // Return empty string during SSR to match server output
  return formatted;
}

/**
 * Hook to safely format numbers on client-side only
 */
export function useFormattedNumber(num: number): string {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    try {
      setFormatted(new Intl.NumberFormat('en-US').format(num));
    } catch {
      setFormatted(String(num));
    }
  }, [num]);

  // Return empty string during SSR to match server output
  return formatted;
}
