import { createAuth } from "@weer.itsmichal.dev/auth";
import { createDb } from "@weer.itsmichal.dev/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
