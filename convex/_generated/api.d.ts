/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_email from "../actions/email.js";
import type * as activityLog from "../activityLog.js";
import type * as clients from "../clients.js";
import type * as contractComments from "../contractComments.js";
import type * as contractFiles from "../contractFiles.js";
import type * as contractVersions from "../contractVersions.js";
import type * as contracts from "../contracts.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as questionnaires from "../questionnaires.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/email": typeof actions_email;
  activityLog: typeof activityLog;
  clients: typeof clients;
  contractComments: typeof contractComments;
  contractFiles: typeof contractFiles;
  contractVersions: typeof contractVersions;
  contracts: typeof contracts;
  helpers: typeof helpers;
  http: typeof http;
  questionnaires: typeof questionnaires;
  users: typeof users;
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
