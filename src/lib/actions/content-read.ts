"use server";

import {
  findDestination,
  findExperience,
  findJourney,
  findStory,
  getSettings,
  listAllExperiencesAdmin,
  listClosures,
  listDestinations,
  listExperiences,
  listAllJourneysAdmin,
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

export async function fetchExperienceAdmin(slug: string) {
  return findExperience(slug);
}

export async function fetchJourneysAdmin() {
  return listAllJourneysAdmin();
}

export async function fetchJourneyAdmin(slug: string) {
  return findJourney(slug);
}

export async function fetchDestinationsAdmin() {
  return listDestinations();
}

export async function fetchDestinationAdmin(slug: string) {
  return findDestination(slug);
}

export async function fetchStoriesAdmin() {
  return listStories();
}

export async function fetchStoryAdmin(slug: string) {
  return findStory(slug);
}

export async function fetchClosuresAdmin() {
  return listClosures();
}

export async function fetchSettingsAdmin() {
  return getSettings();
}
