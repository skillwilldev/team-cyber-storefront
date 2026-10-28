import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Seo from '../../components/Seo/Seo';
import './StubPage.css';

export default function StubPage({ title, text }) {
  const { t } = useTranslation();

  return (
    <div className="container stub">
      {/* placeholder / "not found" pages must not get into the search index (the host answers 200 for any URL) */}
      <Seo noindex />
      <h1>{title}</h1>
      <p>{text || t('stub.defaultText')}</p>
      <Link to="/">{t('common.backToCatalog')}</Link>
    </div>
  );
}
