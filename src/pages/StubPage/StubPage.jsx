import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './StubPage.css';

export default function StubPage({ title, text }) {
  const { t } = useTranslation();

  return (
    <div className="container stub">
      <h1>{title}</h1>
      <p>{text || t('stub.defaultText')}</p>
      <Link to="/">{t('common.backToCatalog')}</Link>
    </div>
  );
}
