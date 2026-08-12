"use server";

import {
  getSettings,
  listAllExperiencesAdmin,
  listClosures,
  listDestinations,
  listExperiences,
  listJourneys,
  listStories,
} from "@/lib/data/repo";

export async function fetchPublicExperiences() {
  return listExperiences();
}

export async function fetchClosuresForExperience(slug: string) {
  return listClosures(slug);
}

export async function fetchExperiencesAdmin() {
  return listAllExperiencesAdmin();
}

export async function fetchJourneysAdmin() {
  return listJourneys();
}

export async function fetchDestinationsAdmin() {
  return listDestinations();
}

export async function fetchStoriesAdmin() {
  return listStories();
}

export async function fetchClosuresAdmin() {
  return listClosures();
}

export async function fetchSettingsAdmin() {
  return getSettings();
}
