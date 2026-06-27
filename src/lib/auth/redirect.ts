export function getSafeRedirectPath(value?: string | null) {
  if (!value) {
    return null;
  }

  if (!value.startsWith('/')) {
    return null;
  }

  if (value.startsWith('//')) {
    return null;
  }

  if (/^[a-z][a-z\d+.-]*:/i.test(value)) {
    return null;
  }

  return value;
}
