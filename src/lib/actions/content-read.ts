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

export async function fetchPublicExperiences() {
  return listExperiences();
}

export async function fetchClosuresForExperience(slug: string) {
  return listClosures(slug);
}

export async function fetchExperiencesAdmin() {
  return listAllExperiencesAdmin();
}

export async function fetchExperienceAdmin(slug: string) {
  return findExperienceAdmin(slug);
}

export async function fetchJourneysAdmin() {
  return listAllJourneysAdmin();
}

export async function fetchJourneyAdmin(slug: string) {
  return findJourneyAdmin(slug);
}

export async function fetchDestinationsAdmin() {
  return listAllDestinationsAdmin();
}

export async function fetchDestinationAdmin(slug: string) {
  return findDestinationAdmin(slug);
}

export async function fetchStoriesAdmin() {
  return listAllStoriesAdmin();
}

export async function fetchStoryAdmin(slug: string) {
  return findStoryAdmin(slug);
}

export async function fetchClosuresAdmin() {
  return listClosures();
}

export async function fetchSettingsAdmin() {
  return getSettings();
}
