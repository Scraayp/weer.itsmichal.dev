import type { Session } from "@weer.itsmichal.dev/auth";
import type { Database } from "@weer.itsmichal.dev/db";

export type Context = {
  session: Session | null;
  db: Database;
};
