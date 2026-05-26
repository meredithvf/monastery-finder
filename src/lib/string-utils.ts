/** True when a string is empty or a known sentinel meaning "no value". */
export function isUnknownSentinel(value: string | null | undefined): boolean {
  if (!value?.trim()) return true;
  const lower = value.trim().toLowerCase();
  return lower === "unknown" || lower === "n/a";
}
