import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.API_URL || "http://localhost:4000",
  emailAndPassword: {
    enabled: true,
  },
});
