import { z } from "zod";

/**
 * Environment variable validation schema.
 * Supabase and integrations are optional so the form can submit without .env (e.g. dev without DB).
 * When NEXT_PUBLIC_SUPABASE_URL is set, init.ts runs full validation (URL + key required).
 */
const envSchema = z
  .object({
    // Supabase (optional – form works without; init validates when URL is set)
    NEXT_PUBLIC_SUPABASE_URL: z
      .string()
      .url("Invalid Supabase URL")
      .optional()
      .or(z.literal("")),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

    // Site configuration
    NEXT_PUBLIC_SITE_URL: z
      .string()
      .url("Invalid site URL")
      .optional()
      .or(z.literal("")),

    // Integrations (optional)
    PIPEDRIVE_API_TOKEN: z.string().optional(),
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    TELEGRAM_CHAT_ID: z.string().optional(),
    SLACK_WEBHOOK_URL: z
      .string()
      .url("Invalid Slack webhook URL")
      .optional()
      .or(z.literal("")),

    // Cloudflare Turnstile (optional)
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    TURNSTILE_SECRET_KEY: z.string().optional(),

    // Node environment
    NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  })
  .refine(
    (data) => {
      const url = data.NEXT_PUBLIC_SUPABASE_URL?.trim();
      if (!url) return true;
      return !!(
        data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
        data.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
      );
    },
    {
      message:
        "Either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required when NEXT_PUBLIC_SUPABASE_URL is set",
      path: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"],
    }
  );

export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validates environment variables and throws descriptive error if validation fails
 * Call this at application startup to fail fast
 */
export function validateEnv(): ValidatedEnv {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Environment variable validation failed:");
    console.error(result.error.format());
    throw new Error(
      `Environment variable validation failed: ${result.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ")}`
    );
  }

  return result.data;
}

/**
 * Get validated environment variables
 * Returns a type-safe, validated environment object
 */
let cachedEnv: ValidatedEnv | null = null;

export function getValidatedEnv(): ValidatedEnv {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Check if specific integrations are configured
 */
export function getIntegrationStatus() {
  const env = getValidatedEnv();

  return {
    pipedrive: !!env.PIPEDRIVE_API_TOKEN,
    telegram: !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    slack: !!env.SLACK_WEBHOOK_URL,
  };
}
