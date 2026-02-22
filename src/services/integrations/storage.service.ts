import { createAdminClient } from "@/lib/supabase/admin";

function toError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallbackMessage);
}

export async function uploadFileToStorage(file: File): Promise<string> {
  try {
    console.log("[storage.service] upload start");

    const supabase = createAdminClient();
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const path = `leads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("kitchen-assets")
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    const { data: publicData } = supabase.storage
      .from("kitchen-assets")
      .getPublicUrl(path);
    if (!publicData.publicUrl) {
      throw new Error("Storage upload succeeded but public URL is missing");
    }

    console.log("[storage.service] file uploaded:", publicData.publicUrl);
    return publicData.publicUrl;
  } catch (error) {
    const normalizedError = toError(error, "Unknown storage upload error");
    console.error("[storage.service] upload failed:", normalizedError);
    throw normalizedError;
  }
}
