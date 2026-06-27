type FormatDateOptions = {
  time?: boolean;
};

export function formatDashboardDate(
  value?: string | Date | null,
  options: FormatDateOptions = {},
): string {
  if (!value) return '-';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

  if (!options.time) {
    return datePart;
  }

  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
    .format(date)
    .replace(/[\u202f\u00a0]/g, ' ');

  return `${datePart} : ${timePart}`;
}
