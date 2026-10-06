import { useState } from 'react';
import { getColorHex, getFilterTitle } from '../../lib/filterLabels';
import Checkbox from '../Checkbox/Checkbox';
import { ChevronIcon, SearchIcon } from '../icons/icons';
import PriceRange from '../PriceRange/PriceRange';
import './FilterPanel.css';

// filter types that are drawn as a list of options; `range` (price) is drawn by PriceRange
const LIST_TYPES = ['checkbox', 'radio', 'color'];

function Section({ id, title, open, onToggle, children }) {
  return (
    <section className="filter">
      <h2>
        <button
          type="button"
          className="filter__head"
          aria-expanded={open}
          aria-controls={`filter-${id}`}
          onClick={onToggle}
        >
          <span>{title}</span>
          <ChevronIcon direction={open ? 'up' : 'down'} size={20} />
        </button>
      </h2>
      {open && (
        <div id={`filter-${id}`} className={`filter__body filter__body--${id}`}>
          {children}
        </div>
      )}
    </section>
  );
}

function Options({ group, selected, onToggle, scrollable }) {
  const [query, setQuery] = useState('');
  const searchable = group.options.length > 6;
  const q = query.trim().toLowerCase();
  const options = q
    ? group.options.filter((o) => `${o.label} ${o.value}`.toLowerCase().includes(q))
    : group.options;

  return (
    <div className={scrollable ? 'filter__scroll' : undefined}>
      {searchable && (
        <div className="filter__search">
          <label htmlFor={`search-${group.key}`}>
            <SearchIcon size={24} />
            <span className="sr-only">Search {getFilterTitle(group).toLowerCase()}</span>
          </label>
          <input
            id={`search-${group.key}`}
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}
      <ul className="filter__list">
        {options.map((o) => (
          <li key={o.value}>
            <Checkbox
              label={o.label ?? o.value}
              swatch={group.type === 'color' ? getColorHex(o.value) : undefined}
              checked={selected.includes(o.value)}
              onChange={() => onToggle(o.value)}
            />
          </li>
        ))}
        {options.length === 0 && <li className="filter__empty">Nothing found</li>}
      </ul>
    </div>
  );
}

/**
 * Filters are DATA-DRIVEN: `groups` is the `filters` array of GET /categories/{slug}
 * ({ key, label, type: checkbox | radio | color | range, options }) — so any category works, nothing is hard-coded.
 * value = { [key]: string[], minPrice: number | null, maxPrice: number | null }
 */
export default function FilterPanel({
  groups,
  value,
  onChange,
  defaultOpen = [],
  withPrice = false,
  scrollable = false,
  priceDelay,
}) {
  const [open, setOpen] = useState(() => new Set(defaultOpen));
  const toggleSection = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleValue = (group, v) => {
    const current = value[group.key] ?? [];
    let next;
    if (group.type === 'radio') next = current.includes(v) ? [] : [v]; // one value at most
    else next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
    onChange({ ...value, [group.key]: next });
  };

  const priceGroup = groups.find((g) => g.key === 'price' && g.type === 'range');
  const hasBounds = priceGroup && Number.isFinite(priceGroup.min) && Number.isFinite(priceGroup.max);
  const listGroups = groups.filter((g) => LIST_TYPES.includes(g.type) && Array.isArray(g.options));

  return (
    <div className="filters">
      {withPrice && hasBounds && (
        <Section id="price" title={getFilterTitle(priceGroup)} open={open.has('price')} onToggle={() => toggleSection('price')}>
          <PriceRange
            bounds={{ min: priceGroup.min, max: priceGroup.max }}
            min={value.minPrice ?? priceGroup.min}
            max={value.maxPrice ?? priceGroup.max}
            delay={priceDelay}
            onChange={(a, b) =>
              onChange({
                ...value,
                // the full range means "no price filter" → keep it out of the URL / request
                minPrice: a <= priceGroup.min ? null : a,
                maxPrice: b >= priceGroup.max ? null : b,
              })
            }
          />
        </Section>
      )}
      {listGroups.map((group) => (
        <Section
          key={group.key}
          id={group.key}
          title={getFilterTitle(group)}
          open={open.has(group.key)}
          onToggle={() => toggleSection(group.key)}
        >
          <Options
            group={group}
            selected={value[group.key] ?? []}
            scrollable={scrollable}
            onToggle={(v) => toggleValue(group, v)}
          />
        </Section>
      ))}
    </div>
  );
}
