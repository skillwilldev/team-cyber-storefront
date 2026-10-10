import { useEffect, useState } from 'react';
import './LoadingHint.css';

/**
 * The API is on free hosting: the first request after a pause can take up to a minute.
 * Mount this component ONLY while loading — after `delay` ms it explains why it takes so long.
 */
export default function LoadingHint({ delay = 4000 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), delay);

    return () => clearTimeout(id);
  }, [delay]);

  if (!visible) return null;

  return (
    <p className="loading-hint" role="status">
      The server is waking up — the first request can take up to a minute. Please wait…
    </p>
  );
}
