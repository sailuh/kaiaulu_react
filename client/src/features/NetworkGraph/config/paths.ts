/**
 *  This file exposes the base path utilized by a hook to load the relevant Network Graph data for a user-specified project
 */

import { PROJECTS_DIRECTORY, TARGET_PROJECT } from "@/config/app.ts";

export const BASE_PATH = `/${PROJECTS_DIRECTORY}/${TARGET_PROJECT}`;