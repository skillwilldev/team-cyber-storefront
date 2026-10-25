import { useTranslation } from 'react-i18next';
import { ChevronIcon } from '../icons/icons';
import './SortSelect.css';

const SORT_KEYS = [
  'rating-desc',
  'price-asc',
  'price-desc',
  'newest',
  'oldest',
  'popular',
  'title-asc',
];

export default function SortSelect({ value, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="sort-select">
      <label className="sr-only" htmlFor="sort">
        {t('catalog.sortLabel')}
      </label>
      <select id="sort" value={value} onChange={(e) => onChange(e.target.value)}>
        {SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {t(`sort.${key}`)}
          </option>
        ))}
      </select>
      <ChevronIcon size={20} />
    </div>
  );
}
