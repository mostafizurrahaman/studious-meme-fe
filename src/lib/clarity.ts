export function getClarityId(): string {
  return process.env.NEXT_PUBLIC_CLARITY_ID?.trim() ?? '';
}

export function isClarityEnabled(): boolean {
  const clarityId = getClarityId();
  return Boolean(clarityId) && clarityId.length > 0;
}
