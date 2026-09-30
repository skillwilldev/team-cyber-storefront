import { SORT_OPTIONS } from '../../lib/catalog';
import { ChevronIcon } from '../icons/icons';
import './SortSelect.css';

export default function SortSelect({ value, onChange }) {
  return (
    <div className="sort-select">
      <label className="sr-only" htmlFor="sort">
        Sort products
      </label>
      <select id="sort" value={value} onChange={(e) => onChange(e.target.value)}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronIcon size={20} />
    </div>
  );
}
