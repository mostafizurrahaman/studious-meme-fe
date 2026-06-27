// export const CACHE_REVALIDATE = {
//   SHORT: 120,
//   DEFAULT: 300,
//   MEDIUM: 1800,
//   LONG: 3600,
// } as const;

export const CACHE_REVALIDATE = {
  SHORT: 60 * 30, // 30 min
  DEFAULT: 60 * 60, // 1 hour
  MEDIUM: 60 * 60 * 6, // 6 hours
  LONG: 60 * 60 * 24, // 24 hours
} as const;
