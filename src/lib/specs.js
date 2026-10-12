/**
 * Product `specs` from the API is { "<georgian name>": "value" } — the same shape for every category.
 * Below: English names + grouping for the smartphone keys; unknown keys are shown as they come.
 */
export const SPEC_LABELS = {
  'ეკრანი': 'Screen',
  'განახლების სიხშირე': 'Refresh rate',
  'პროცესორი': 'CPU',
  'ოპერატიული მეხსიერება': 'RAM',
  'მეხსიერება': 'Storage',
  'ძირითადი კამერა': 'Main camera',
  'წინა კამერა': 'Front camera',
  'ბატარეა': 'Battery capacity',
  'დატენვა': 'Charging',
  'ოპერაციული სისტემა': 'Operating system',
  'დაცვა': 'Protection class',
  'ფერი': 'Color',
  'გარანტია': 'Warranty',
};

const SPEC_GROUPS = [
  { title: 'Screen', keys: ['ეკრანი', 'განახლების სიხშირე'] },
  { title: 'CPU', keys: ['პროცესორი', 'ოპერატიული მეხსიერება', 'მეხსიერება', 'ოპერაციული სისტემა'] },
  { title: 'Camera', keys: ['ძირითადი კამერა', 'წინა კამერა'] },
  { title: 'Battery', keys: ['ბატარეა', 'დატენვა'] },
  { title: 'Protection', keys: ['დაცვა'] },
];

// the 6 "quick specs" under the price
export const QUICK_KEYS = ['ეკრანი', 'პროცესორი', 'ოპერატიული მეხსიერება', 'ძირითადი კამერა', 'წინა კამერა', 'ბატარეა'];

export const getSpecLabel = (key) => SPEC_LABELS[key] ?? key;

export function getQuickSpecs(specs = {}) {
  const known = QUICK_KEYS.filter((key) => specs[key]).map((key) => ({ key, value: specs[key] }));
  if (known.length >= 3) return known;

  return Object.entries(specs)
    .slice(0, 6)
    .map(([key, value]) => ({ key, value }));
}

/** → { main: [{ title, rows }], more: [...] } — "more" is hidden behind the "View More" button. */
export function buildSpecGroups(specs = {}) {
  const used = new Set();
  const groups = SPEC_GROUPS.map(({ title, keys }) => {
    const present = keys.filter((key) => specs[key]);
    present.forEach((key) => used.add(key));

    return { title, rows: present.map((key) => ({ label: getSpecLabel(key), value: specs[key] })) };
  }).filter((g) => g.rows.length > 0);

  const rest = Object.keys(specs).filter((key) => !used.has(key));
  if (rest.length > 0) {
    groups.push({
      title: groups.length > 0 ? 'Other' : 'Specifications',
      rows: rest.map((key) => ({ label: getSpecLabel(key), value: specs[key] })),
    });
  }

  return { main: groups.slice(0, 2), more: groups.slice(2) };
}
