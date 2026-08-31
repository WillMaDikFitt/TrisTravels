/** Child ages used across curated and experience booking: under 1 (−1) through 9. */
export const CHILD_AGE_SELECT_OPTIONS = [
  { value: "-1", label: "Under 1 year" },
  ...Array.from({ length: 9 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} year${i + 1 === 1 ? "" : "s"}`,
  })),
] as const;

export const CHILD_AGE_MIN = -1;
export const CHILD_AGE_MAX = 9;

export function isValidChildAge(age: number) {
  return Number.isFinite(age) && age >= CHILD_AGE_MIN && age <= CHILD_AGE_MAX;
}
