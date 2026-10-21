import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n';
import { MonitorIcon, MoonIcon, SunIcon } from '../Header/HeaderIcons';
import './ThemeToggle.css';

/** Order of the cycle: light → dark → system → light … */
const MODES = [
  { value: 'light', Icon: SunIcon, switchKey: 'theme.switchToLight' },
  { value: 'dark', Icon: MoonIcon, switchKey: 'theme.switchToDark' },
  { value: 'system', Icon: MonitorIcon, switchKey: 'theme.switchToSystem' },
];

/**
 * Theme toggle: ONE button that cycles light → dark → system.
 * The three icons are stacked; the active one turns and fades in, the others turn and fade out.
 * `withLabel` (mobile menu) turns it into a full-width row with the name of the current mode.
 * The three states of FE-009 are kept: `system` still follows the OS preference live.
 */
export default function ThemeToggle({ className = '', withLabel = false }) {
  const { preference, setTheme } = useTheme();
  const { t } = useTranslation();

  const current = Math.max(0, MODES.findIndex((m) => m.value === preference));
  const next = MODES[(current + 1) % MODES.length];
  const nextLabel = t(next.switchKey);

  return (
    <button
      type="button"
      className={`theme-toggle${withLabel ? ' theme-toggle--row' : ''} ${className}`.trim()}
      onClick={() => setTheme(next.value)}
      aria-label={nextLabel}
      title={nextLabel}
    >
      <span className="theme-toggle__icons" aria-hidden="true">
        {MODES.map(({ value, Icon }, i) => (
          <span
            key={value}
            className="theme-toggle__icon"
            data-state={i === current ? 'active' : i < current ? 'before' : 'after'}
          >
            <Icon />
          </span>
        ))}
      </span>
      {withLabel && <span className="theme-toggle__label">{t(`theme.${MODES[current].value}`)}</span>}
    </button>
  );
}
