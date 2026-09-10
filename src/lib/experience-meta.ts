import type { Experience } from "@/data/experiences";

export type ExperienceTransportMode = "none" | "optional" | "required";

export function isTrekExperience(exp: Pick<Experience, "tags" | "category" | "name">) {
  if (exp.tags.some((t) => /trek/i.test(t))) return true;
  return /\btrek\b/i.test(exp.name);
}

export function experienceTransportMode(
  exp: Pick<Experience, "transportMode" | "transportAvailable">,
): ExperienceTransportMode {
  if (exp.transportMode) return exp.transportMode;
  // Explicit false keeps transport off; otherwise show options (optional).
  if (exp.transportAvailable === false) return "none";
  return "optional";
}

export function experienceSortKey(exp: Pick<Experience, "sortOrder" | "name">, index: number) {
  return exp.sortOrder ?? index * 10;
}

export function sortExperiences<T extends Pick<Experience, "sortOrder" | "name">>(items: T[]) {
  return [...items].sort((a, b) => {
    const ai = items.indexOf(a);
    const bi = items.indexOf(b);
    const order = experienceSortKey(a, ai) - experienceSortKey(b, bi);
    if (order !== 0) return order;
    return a.name.localeCompare(b.name);
  });
}
