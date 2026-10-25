import { useTranslation } from 'react-i18next';
import './QueryError.css';

export default function QueryError({ title, message, onRetry }) {
  const { t } = useTranslation();

  return (
    <div className="query-error" role="alert">
      <h2>{title || t('common.somethingWentWrong')}</h2>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry}>
          {t('common.tryAgain')}
        </button>
      )}
    </div>
  );
}
