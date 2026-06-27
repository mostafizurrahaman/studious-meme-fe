import type { CSSProperties } from 'react';

const fallbackGradient = 'bg-linear-to-br from-primary to-secondary';

function isCssColor(value: string) {
  return (
    value.startsWith('#') ||
    value.startsWith('rgb(') ||
    value.startsWith('rgba(') ||
    value.startsWith('hsl(') ||
    value.startsWith('hsla(') ||
    value.startsWith('oklch(')
  );
}

export function getCategoryAccentClassName(accent?: string) {
  const value = accent?.trim();

  if (!value || isCssColor(value) || value.startsWith('linear-gradient')) {
    return fallbackGradient;
  }

  return `bg-linear-to-br ${value}`;
}

export function getCategoryAccentStyle(
  accent?: string,
): CSSProperties | undefined {
  const value = accent?.trim();

  if (!value) {
    return undefined;
  }

  if (value.startsWith('linear-gradient')) {
    return { background: value };
  }

  if (isCssColor(value)) {
    return {
      background: `linear-gradient(135deg, ${value} 0%, color-mix(in srgb, ${value} 64%, #0e2f56) 100%)`,
    };
  }

  return undefined;
}
