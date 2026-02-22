/**
 * Application initialization
 * This file should be imported at the top of your root layout or instrumentation file.
 * Validates environment variables at startup when Supabase URL is set (so build can run without .env).
 */

import { validateEnv } from "./env.validation";

if (typeof window === "undefined") {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      validateEnv();
      console.log("✅ Environment variables validated successfully");
    } catch (error) {
      console.error(
        "❌ Failed to start application due to invalid environment configuration"
      );
      throw error;
    }
  }
}

export {};
