import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LoadingHint.css';

/**
 * The API is on free hosting: the first request after a pause can take up to a minute.
 * Mount this component ONLY while loading — after `delay` ms it explains why it takes so long.
 */
export default function LoadingHint({ delay = 4000 }) {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), delay);

    return () => clearTimeout(id);
  }, [delay]);

  if (!visible) return null;

  return (
    <p className="loading-hint" role="status">
      {t('loadingHint')}
    </p>
  );
}
