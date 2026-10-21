import { useTranslation, LANGUAGES } from '@/lib/i18n';
import './LanguageSwitcher.css';

/** Short labels written in the language itself (Georgian uses the ADG2 font in the header). */
const LABELS = { ka: 'ქარ', en: 'ENG' };

/**
 * Language switch: a segmented pill with a sliding thumb.
 * The thumb position comes from the --i custom property (index of the active language),
 * so adding a third language only needs a new entry in LANGUAGES / LABELS.
 */
export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useTranslation();
  const index = Math.max(0, LANGUAGES.indexOf(lang));

  return (
    <div
      className={`lang-switch ${className}`.trim()}
      role="group"
      aria-label={t('header.language')}
      style={{ '--i': index, '--n': LANGUAGES.length }}
    >
      <span className="lang-switch__thumb" aria-hidden="true" />
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          className="lang-switch__btn"
          onClick={() => setLang(code)}
          title={t(`lang.${code}`)}
        >
          {LABELS[code] ?? code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
