import { CheckIcon } from '../icons/icons';
import './Checkbox.css';

/**
 * Custom checkbox / radio: the real <input> is visually hidden, the control is drawn with CSS.
 * `type` = 'checkbox' (square, several values) | 'radio' (round, one value). `name` groups radios for the keyboard.
 * `swatch` adds a colour dot (color filters).
 */

export default function Checkbox({ label, count, checked, onChange, swatch, type = 'checkbox', name }) {
  const isRadio = type === 'radio';

  return (
    <label className={`checkbox${isRadio ? ' checkbox--radio' : ''}`}>
      <input
        type={isRadio ? 'radio' : 'checkbox'}
        name={name}
        className="checkbox__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="checkbox__box" aria-hidden="true">
        {!isRadio && <CheckIcon size={12} />}
      </span>
      {swatch && <span className="checkbox__swatch" style={{ background: swatch }} aria-hidden="true" />}
      <span className="checkbox__label">{label}</span>
      {count !== undefined && <span className="checkbox__count">{count}</span>}
    </label>
  );
}
