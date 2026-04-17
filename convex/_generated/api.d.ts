/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appointments from "../appointments.js";
import type * as billing from "../billing.js";
import type * as campaigns from "../campaigns.js";
import type * as chat from "../chat.js";
import type * as chatbots from "../chatbots.js";
import type * as cleanup from "../cleanup.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as mail from "../mail.js";
import type * as sources from "../sources.js";
import type * as users from "../users.js";
import type * as whatsapp from "../whatsapp.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appointments: typeof appointments;
  billing: typeof billing;
  campaigns: typeof campaigns;
  chat: typeof chat;
  chatbots: typeof chatbots;
  cleanup: typeof cleanup;
  crons: typeof crons;
  files: typeof files;
  mail: typeof mail;
  sources: typeof sources;
  users: typeof users;
  whatsapp: typeof whatsapp;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
