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

/** Experiences take children from 3; curated journeys still allow babies. */
export const EXPERIENCE_CHILD_AGE_MIN = 3;

export function childAgeOptions(minAge: number = CHILD_AGE_MIN) {
  return CHILD_AGE_SELECT_OPTIONS.filter((option) => Number(option.value) >= minAge);
}

/** "3–9" / "Ages 3 to 9 years", or the under-1 wording when babies are allowed. */
export function childAgeNote(minAge: number = CHILD_AGE_MIN, compact = false) {
  if (minAge > 0) {
    return compact ? `${minAge}–${CHILD_AGE_MAX}` : `Ages ${minAge} to ${CHILD_AGE_MAX} years`;
  }
  return compact ? "Under 1–9" : "Ages under 1 (−1) to 9 years";
}

export function isValidChildAge(age: number, minAge: number = CHILD_AGE_MIN) {
  return Number.isFinite(age) && age >= minAge && age <= CHILD_AGE_MAX;
}

export function isValidExperienceChildAge(age: number) {
  return isValidChildAge(age, EXPERIENCE_CHILD_AGE_MIN);
}
