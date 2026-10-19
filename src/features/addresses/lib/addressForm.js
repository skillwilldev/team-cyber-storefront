/**
 * Pure helpers for the address form (FE-006). No React inside → easy to test.
 */

export const MAX_ADDRESSES = 10;

/** Fields that go to the server as they are. (`isDefault` is handled separately.) */
export const ADDRESS_FIELDS = ['label', 'fullName', 'phone', 'city', 'address'];

const FORM_FIELDS = [...ADDRESS_FIELDS, 'isDefault'];

/**
 * API address → form values. `label` can be null on the server → '' in the form.
 * A new address starts with the user's name (the receiver is usually the buyer), and the very first
 * address is always the default one.
 */
export function toFormValues(address, { user, isFirst = false } = {}) {
  return {
    label: address?.label ?? '',
    fullName: address?.fullName ?? user?.name ?? '',
    phone: address?.phone ?? '',
    city: address?.city ?? '',
    address: address?.address ?? '',
    isDefault: address?.isDefault ?? isFirst,
  };
}

/** POST body. An empty label is simply left out. */
export function buildCreateBody(values) {
  const { label, ...rest } = values;
  return label ? { label, ...rest } : rest;
}

/**
 * PATCH body: ONLY what actually changed. `label: ''` is sent on purpose — it clears the label.
 * `isDefault` is sent only as `true` (the default cannot be switched off — make ANOTHER address the default).
 */
export function buildPatch({ dirtyFields, values, initial }) {
  const baseline = toFormValues(initial);
  const patch = {};

  for (const key of ADDRESS_FIELDS) {
    if (dirtyFields[key] && values[key] !== baseline[key]) patch[key] = values[key];
  }
  if (dirtyFields.isDefault && values.isDefault === true && !initial.isDefault) patch.isDefault = true;

  return Object.keys(patch).length ? patch : null;
}

/** True when there is something to send (drives the disabled state of "Save"). */
export function hasChanges(dirtyFields) {
  return FORM_FIELDS.some((key) => dirtyFields[key]);
}

/**
 * Put server field errors under the matching inputs.
 * Returns the messages that have no input, for the banner.
 */
export function applyServerErrors(serverErrors, setError) {
  const orphans = [];
  let first = true;
  for (const [field, message] of Object.entries(serverErrors ?? {})) {
    if (FORM_FIELDS.includes(field)) {
      setError(field, { type: 'server', message }, { shouldFocus: first });
      first = false;
    } else {
      orphans.push(message);
    }
  }
  return orphans;
}
