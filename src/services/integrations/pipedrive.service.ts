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

export async function sendToPipedrive(
  payload: LeadPayload,
  context: IntegrationContext
): Promise<void> {
  try {
    const apiToken = process.env.PIPEDRIVE_API_TOKEN;
    if (!apiToken) {
      throw new Error("Missing PIPEDRIVE_API_TOKEN");
    }

    const baseUrl =
      process.env.PIPEDRIVE_API_URL ?? "https://api.pipedrive.com/v1";
    const personUrl = `${baseUrl}/persons?api_token=${apiToken}`;
    const leadUrl = `${baseUrl}/leads?api_token=${apiToken}`;
    const noteUrl = `${baseUrl}/notes?api_token=${apiToken}`;

    const message = payload.message ?? "";
    const budget = payload.budget ?? "—";

    console.log("[pipedrive.service] person create start");
    const personResponse = await fetch(personUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email
          ? [
              {
                value: payload.email,
                primary: true,
              },
            ]
          : undefined,
        phone: payload.phone
          ? [
              {
                value: payload.phone,
                primary: true,
              },
            ]
          : undefined,
      }),
    });

    if (!personResponse.ok) {
      const text = await personResponse.text();
      throw new Error(
        `Pipedrive person error: ${personResponse.status} ${text}`
      );
    }

    const personData = (await personResponse.json()) as {
      data?: { id?: number };
    };
    const personId = personData.data?.id;
    if (!personId) {
      throw new Error("Pipedrive person created without ID");
    }

    console.log("[pipedrive.service] lead create start");
    const leadResponse = await fetch(leadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `Заявка з сайту: ${payload.name} (${payload.phone})`,
        person_id: personId,
      }),
    });

    if (!leadResponse.ok) {
      const text = await leadResponse.text();
      throw new Error(`Pipedrive error: ${leadResponse.status} ${text}`);
    }

    const leadData = (await leadResponse.json()) as { data?: { id?: string } };
    const leadId = leadData.data?.id;
    if (!leadId) {
      throw new Error("Pipedrive lead created without ID");
    }

    const noteContent = [
      `Повідомлення: ${message}`,
      `Бюджет: ${budget}`,
      `Файл: ${context.fileUrl || "—"}`,
    ].join("\n");

    console.log("[pipedrive.service] note create start");
    const noteResponse = await fetch(noteUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lead_id: leadId,
        content: noteContent,
      }),
    });

    if (!noteResponse.ok) {
      const text = await noteResponse.text();
      throw new Error(`Pipedrive notes error: ${noteResponse.status} ${text}`);
    }

    console.log("[pipedrive.service] lead synced successfully");
  } catch (error) {
    const normalizedError = toError(
      error,
      "Unknown Pipedrive integration error"
    );
    console.error("[pipedrive.service] failed:", normalizedError);
    throw normalizedError;
  }
}
