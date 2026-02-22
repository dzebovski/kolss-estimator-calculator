import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  IntegrationContext,
  LeadPayload,
} from "@/services/integrations/types";

function toError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallbackMessage);
}

/** Returns true if the lead was saved, false if Supabase is not configured (skipped). */
export async function saveLeadToDatabase(
  payload: LeadPayload,
  context: IntegrationContext
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.log("[leads.service] Supabase not configured, skipping insert");
    return false;
  }
  try {
    console.log("[leads.service] supabase insert start");

    const supabase = createAdminClient();
    const { error } = await supabase.from("leads").insert({
      name: payload.name,
      phone: payload.phone,
      email: payload.email || null,
      message: payload.message ?? null,
      preferred_contact: payload.preferredContact ?? "phone",
      budget: payload.budget || null,
      file_url: context.fileUrl,
    });

    if (error) {
      throw new Error(`Leads insert error: ${error.message}`);
    }

    console.log("[leads.service] lead inserted");
    return true;
  } catch (error) {
    const normalizedError = toError(error, "Unknown leads insert error");
    console.error("[leads.service] failed:", normalizedError);
    throw normalizedError;
  }
}
