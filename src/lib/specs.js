/**
 * Product `specs` from the API is { "<georgian name>": "value" } — the same shape for every category.
 * The API is Georgian-only, so the spec NAMES (keys) are mapped to i18n keys (`specs.*` in locales/*.json)
 * and translated in the UI; the VALUES stay as the API sends them. Unknown names are shown as they come.
 */
export const SPEC_I18N_KEYS = {
  'ეკრანი': 'specs.screen',
  'განახლების სიხშირე': 'specs.refreshRate',
  'პროცესორი': 'specs.cpu',
  'ოპერატიული მეხსიერება': 'specs.ram',
  'მეხსიერება': 'specs.storage',
  'ძირითადი კამერა': 'specs.mainCamera',
  'წინა კამერა': 'specs.frontCamera',
  'ბატარეა': 'specs.battery',
  'დატენვა': 'specs.charging',
  'ოპერაციული სისტემა': 'specs.os',
  'დაცვა': 'specs.protection',
  'ფერი': 'specs.color',
  'გარანტია': 'specs.warranty',
};

const SPEC_GROUPS = [
  { titleKey: 'specs.groupScreen', keys: ['ეკრანი', 'განახლების სიხშირე'] },
  { titleKey: 'specs.groupCpu', keys: ['პროცესორი', 'ოპერატიული მეხსიერება', 'მეხსიერება', 'ოპერაციული სისტემა'] },
  { titleKey: 'specs.groupCamera', keys: ['ძირითადი კამერა', 'წინა კამერა'] },
  { titleKey: 'specs.groupBattery', keys: ['ბატარეა', 'დატენვა'] },
  { titleKey: 'specs.groupProtection', keys: ['დაცვა'] },
];

// the 6 "quick specs" under the price
export const QUICK_KEYS = ['ეკრანი', 'პროცესორი', 'ოპერატიული მეხსიერება', 'ძირითადი კამერა', 'წინა კამერა', 'ბატარეა'];

/** Spec name → label in the current language (`t` comes from useTranslation). */
export const getSpecLabel = (key, t) => (SPEC_I18N_KEYS[key] ? t(SPEC_I18N_KEYS[key]) : key);

export function getQuickSpecs(specs = {}) {
  const known = QUICK_KEYS.filter((key) => specs[key]).map((key) => ({ key, value: specs[key] }));
  if (known.length >= 3) return known;

  return Object.entries(specs)
    .slice(0, 6)
    .map(([key, value]) => ({ key, value }));
}

/** → { main: [{ title, rows }], more: [...] } — "more" is hidden behind the "View More" button. */
export function buildSpecGroups(specs = {}, t) {
  const used = new Set();
  const groups = SPEC_GROUPS.map(({ titleKey, keys }) => {
    const present = keys.filter((key) => specs[key]);
    present.forEach((key) => used.add(key));

    return { title: t(titleKey), rows: present.map((key) => ({ label: getSpecLabel(key, t), value: specs[key] })) };
  }).filter((g) => g.rows.length > 0);

  const rest = Object.keys(specs).filter((key) => !used.has(key));
  if (rest.length > 0) {
    groups.push({
      title: t(groups.length > 0 ? 'specs.groupOther' : 'specs.groupDefault'),
      rows: rest.map((key) => ({ label: getSpecLabel(key, t), value: specs[key] })),
    });
  }

  return { main: groups.slice(0, 2), more: groups.slice(2) };
}
