import { useEffect, useRef, useState } from 'react';
import './PriceRange.css';

const format = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

function PriceInput({ id, label, value, align, onCommit }) {
  const [text, setText] = useState(format(value));
  // keep the text in sync when the value is changed from outside (slider, reset) — no effect needed
  const [shownValue, setShownValue] = useState(value);
  if (shownValue !== value) {
    setShownValue(value);
    setText(format(value));
  }

  const commit = () => {
    const n = parseInt(text.replace(/\D/g, ''), 10);
    if (Number.isNaN(n)) setText(format(value));
    else onCommit(n);
  };

  return (
    <div className={`price-range__field price-range__field--${align}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
      />
    </div>
  );
}

/**
 * bounds — the real price range of the category (from the API filter { key: 'price', min, max }).
 * min / max — the currently selected range.
 * While the slider is dragged only the local draft changes; onChange (→ URL → API request)
 * fires `delay` ms after the last movement, so we do not send a request per pixel.
 * delay = 0 → call onChange immediately (mobile filters screen: nothing is fetched until "Apply").
 */
export default function PriceRange({ bounds, min, max, onChange, delay = 400 }) {
  const [draft, setDraft] = useState({ min, max });
  const [synced, setSynced] = useState({ min, max });
  const timer = useRef(null);

  // parent value changed (reset filters, Back button...) → take it as the new draft
  if (synced.min !== min || synced.max !== max) {
    setSynced({ min, max });
    setDraft({ min, max });
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const apply = (a, b, immediate = false) => {
    setDraft({ min: a, max: b });
    clearTimeout(timer.current);
    if (immediate || delay === 0) onChange(a, b);
    else timer.current = setTimeout(() => onChange(a, b), delay);
  };

  const span = Math.max(1, bounds.max - bounds.min);
  const pct = (n) => ((clamp(n, bounds.min, bounds.max) - bounds.min) / span) * 100;

  return (
    <div className="price-range">
      <div className="price-range__inputs">
        <PriceInput
          id="price-from"
          label="From"
          value={draft.min}
          align="left"
          onCommit={(v) => apply(clamp(v, bounds.min, draft.max), draft.max, true)}
        />
        <span className="price-range__dash" aria-hidden="true" />
        <PriceInput
          id="price-to"
          label="To"
          value={draft.max}
          align="right"
          onCommit={(v) => apply(draft.min, clamp(v, draft.min, bounds.max), true)}
        />
      </div>

      <div className="price-range__slider">
        <div className="price-range__track">
          <div className="price-range__fill" style={{ left: `${pct(draft.min)}%`, right: `${100 - pct(draft.max)}%` }} />
        </div>
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={1}
          value={draft.min}
          aria-label="Minimum price"
          onChange={(e) => apply(Math.min(Number(e.target.value), draft.max), draft.max)}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={1}
          value={draft.max}
          aria-label="Maximum price"
          onChange={(e) => apply(draft.min, Math.max(Number(e.target.value), draft.min))}
        />
      </div>
    </div>
  );
}
