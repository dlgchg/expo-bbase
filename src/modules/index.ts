import type { ModuleDef } from "../types";
import networkModule from "./network";
import stateModule from "./state";
import storageModule from "./storage";
import paymentModule from "./payment";
import formModule from "./form";
import imageModule from "./image";
import videoModule from "./video";
import authGoogleModule from "./auth-google";
import authFacebookModule from "./auth-facebook";
import authAppleModule from "./auth-apple";
import webviewModule from "./webview";
import i18nModule from "./i18n";
import animationModule from "./animation";
import otaModule from "./ota";
import notificationModule from "./notification";
import permissionModule from "./permission";
import bottomSheetModule from "./bottom-sheet";
import flashlistModule from "./flashlist";
import uiReusablesModule from "./ui-reusables";

/** All available modules, in display order */
export const modules: ModuleDef[] = [
  // P0 — Core (default checked)
  networkModule,
  stateModule,
  storageModule,
  // Note: expo-router and nativewind are always included in the base template

  // P1 — Feature modules
  paymentModule,
  formModule,
  imageModule,
  videoModule,
  authGoogleModule,
  authFacebookModule,
  authAppleModule,
  webviewModule,
  i18nModule,
  animationModule,

  // P2 — Additional modules
  otaModule,
  notificationModule,
  permissionModule,
  bottomSheetModule,
  flashlistModule,
  uiReusablesModule,
];

/**
 * Get a module by its ID.
 */
export function getModuleById(id: string): ModuleDef | undefined {
  return modules.find((m) => m.id === id);
}

/**
 * Get all module IDs.
 */
export function getModuleIds(): string[] {
  return modules.map((m) => m.id);
}

/**
 * Get modules by a list of IDs.
 */
export function getModulesByIds(ids: string[]): ModuleDef[] {
  return ids
    .map((id) => getModuleById(id))
    .filter((m): m is ModuleDef => m !== undefined);
}
