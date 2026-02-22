import { getValidatedEnv } from "@/lib/config/env.validation";

export function isSupabaseConfigured(): boolean {
  const env = getValidatedEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return false;
  const key =
    env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return !!key;
}

export function getSupabaseUrl() {
  const env = getValidatedEnv();
  return env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
}

export function getSupabasePublishableKey() {
  const env = getValidatedEnv();
  return (
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  );
}

export function getSupabaseServiceRoleKey() {
  const env = getValidatedEnv();
  return env.SUPABASE_SERVICE_ROLE_KEY ?? null;
}
