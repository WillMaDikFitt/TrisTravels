"use server";

import {
  findDestinationAdmin,
  findExperienceAdmin,
  findJourneyAdmin,
  findStoryAdmin,
  getSettings,
  listAllDestinationsAdmin,
  listAllExperiencesAdmin,
  listAllJourneysAdmin,
  listAllStoriesAdmin,
  listClosures,
  listExperiences,
} from "@/lib/data/repo";
import { sanitizeForClient } from "@/lib/firebase/admin-read";

function clean<T>(value: T): T {
  return sanitizeForClient(value) as T;
}

export async function fetchPublicExperiences() {
  return listExperiences();
}

export async function fetchClosuresForExperience(slug: string) {
  return listClosures(slug);
}

export async function fetchExperiencesAdmin() {
  return clean(await listAllExperiencesAdmin());
}

export async function fetchExperienceAdmin(slug: string) {
  return clean(await findExperienceAdmin(slug));
}

export async function fetchJourneysAdmin() {
  return clean(await listAllJourneysAdmin());
}

export async function fetchJourneyAdmin(slug: string) {
  return clean(await findJourneyAdmin(slug));
}

export async function fetchDestinationsAdmin() {
  return clean(await listAllDestinationsAdmin());
}

export async function fetchDestinationAdmin(slug: string) {
  return clean(await findDestinationAdmin(slug));
}

export async function fetchStoriesAdmin() {
  return clean(await listAllStoriesAdmin());
}

export async function fetchStoryAdmin(slug: string) {
  return clean(await findStoryAdmin(slug));
}

export async function fetchClosuresAdmin() {
  return listClosures();
}

export async function fetchSettingsAdmin() {
  return getSettings();
}
