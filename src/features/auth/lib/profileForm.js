/**
 * Pure helpers for the profile form (FE-004). No React inside → easy to test.
 */

/** Fields the user can edit that go to the server as-is. */
export const PROFILE_FIELDS = ['name', 'email', 'phone', 'city', 'address'];

/** Everything that is a real form field (used to route server errors to inputs). */
export const FORM_FIELDS = [...PROFILE_FIELDS, 'newPassword', 'confirmNewPassword', 'currentPassword'];

/** API user → form values. phone/city/address can be null on the server → '' in the form. */
export function toFormValues(user) {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    city: user?.city ?? '',
    address: user?.address ?? '',
    newPassword: '',
    confirmNewPassword: '',
    currentPassword: '',
  };
}

/**
 * Build the PATCH body: ONLY what actually changed (+ the always-required currentPassword).
 * `dirtyFields` comes from React Hook Form, `values` are the validated (trimmed) values,
 * `initial` is the user as the server knows it — so "typed a space and removed it" sends nothing.
 */
export function buildPatch({ dirtyFields, values, initial }) {
  const baseline = toFormValues(initial);
  const patch = {};

  for (const key of PROFILE_FIELDS) {
    if (dirtyFields[key] && values[key] !== baseline[key]) {
      patch[key] = values[key]; // '' is sent on purpose: it clears phone/city/address
    }
  }
  if (values.newPassword) patch.newPassword = values.newPassword;

  return Object.keys(patch).length ? { currentPassword: values.currentPassword, ...patch } : null;
}

/** True when there is something to send (drives the disabled state of "Save"). */
export function hasChanges(dirtyFields) {
  return PROFILE_FIELDS.some((k) => dirtyFields[k]) || Boolean(dirtyFields.newPassword);
}

/**
 * Put server field errors under the matching inputs.
 * Returns the messages that have no input (e.g. `errors._` = "nothing to change") for the banner.
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
