import { CheckIcon } from '../icons/icons';
import './Checkbox.css';

/** Custom checkbox: real <input> is visually hidden, the box is drawn with CSS. `swatch` adds a colour dot (color filters). */

export default function Checkbox({ label, count, checked, onChange, swatch }) {
  return (
    <label className="checkbox">
      <input
        type="checkbox"
        className="checkbox__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="checkbox__box" aria-hidden="true">
        <CheckIcon size={12} />
      </span>
      {swatch && <span className="checkbox__swatch" style={{ background: swatch }} aria-hidden="true" />}
      <span className="checkbox__label">{label}</span>
      {count !== undefined && <span className="checkbox__count">{count}</span>}
    </label>
  );
}
