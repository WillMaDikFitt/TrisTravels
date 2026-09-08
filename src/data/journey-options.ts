import type { FleetVehicle, TransportVehicleId } from "./transport";
import {
  DEFAULT_FLEET_VEHICLES,
  activeFleetVehicles,
  vehicleImages,
} from "./transport";
import { media } from "./media";

/** Curated booking window: online book when start date is ≥ this many days away. */
export const CURATED_ONLINE_BOOK_DAYS = 25;

/** Balance due this many days before travel start. */
export const CURATED_BALANCE_DUE_DAYS = 20;

export function daysUntilDate(isoDate: string) {
  const target = new Date(`${isoDate}T12:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

export function canBookCuratedOnline(startDate: string) {
  if (!startDate) return false;
  return daysUntilDate(startDate) >= CURATED_ONLINE_BOOK_DAYS;
}

/** End date from start + journey length (nights). */
export function journeyEndDate(startIso: string, nights: number) {
  if (!startIso) return "";
  const d = new Date(`${startIso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.max(0, nights));
  return d.toISOString().slice(0, 10);
}

export type PackageTransportId =
  | "sedan"
  | "suv"
  | "innova"
  | "tempo10"
  | "tempo12"
  | "tempo15"
  | "urbania10"
  | "urbania12"
  | (string & {});

export type PackageTransportMeta = {
  id: string;
  label: string;
  maxGuests: number;
  idealFor: string;
  luggage: string;
  ac: string;
  windows?: string;
  bestFor: string;
  goodToKnow: string;
  examples?: string;
  summary: string;
  images: string[];
};

export function fleetVehicleToPackageMeta(vehicle: FleetVehicle): PackageTransportMeta {
  const images = vehicleImages(vehicle);
  return {
    id: vehicle.id,
    label: vehicle.label,
    maxGuests: vehicle.maxGuests || 4,
    idealFor: vehicle.idealFor,
    luggage: vehicle.luggage,
    ac: vehicle.ac || "Yes",
    windows: vehicle.windows,
    bestFor: vehicle.bestFor,
    goodToKnow: vehicle.goodToKnow,
    examples: vehicle.examples,
    summary: vehicle.summary,
    images: images.length ? images : [media.ride],
  };
}

/** Code defaults — prefer Studio fleet at runtime via packageTransportMeta(..., fleet). */
export const PACKAGE_TRANSPORT: PackageTransportMeta[] = DEFAULT_FLEET_VEHICLES.map(fleetVehicleToPackageMeta);

export const PACKAGE_TRANSPORT_IDS = PACKAGE_TRANSPORT.map((t) => t.id);

export function packageTransportList(fleet?: FleetVehicle[] | null): PackageTransportMeta[] {
  const list = fleet?.length ? activeFleetVehicles(fleet) : DEFAULT_FLEET_VEHICLES;
  return list.map(fleetVehicleToPackageMeta);
}

export function packageTransportMeta(id: string, fleet?: FleetVehicle[] | null) {
  const list = packageTransportList(fleet);
  const normalized = id === "tempo" ? "tempo12" : id;
  return list.find((t) => t.id === normalized) ?? list[0] ?? PACKAGE_TRANSPORT[0];
}

/** Map legacy transport ids used in older package pricing. */
export function normalizePackageTransportId(id: string): PackageTransportId {
  if (id === "tempo") return "tempo12";
  if (listHasId(id)) return id;
  return "sedan";
}

function listHasId(id: string) {
  return PACKAGE_TRANSPORT_IDS.includes(id) || DEFAULT_FLEET_VEHICLES.some((v) => v.id === id);
}

/** Bridge to older TransportVehicleId for pricing maps that still use 4 keys. */
export function toLegacyTransportId(id: string): TransportVehicleId {
  if (id === "sedan" || id === "suv" || id === "innova") return id;
  return "tempo";
}

export type StayStyleId = import("./stay-styles").StayStyleId;
export type StayStyleMeta = import("./stay-styles").StayStyleMeta;

export {
  STAY_STYLES,
  STAY_STYLE_IDS,
  BOOKING_STAY_STYLE_IDS,
  STAY_IMAGE_NOTE,
  stayStyleMeta,
  stayStyleList,
  bookingStayStyles,
  normalizeStayStyleId,
  DEFAULT_STAY_STYLES,
  hydrateStayStylesFromDefaults,
  mergeStayStyles,
  activeStayStyles,
  slugifyStayId,
} from "./stay-styles";
export type { StayStyle } from "./stay-styles";
