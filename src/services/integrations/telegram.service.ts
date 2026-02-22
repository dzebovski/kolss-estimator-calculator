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

function buildMessage(payload: LeadPayload, fileUrl: string | null) {
  const message = payload.message ?? "";
  const budget = payload.budget ?? "—";
  const preferredContact = payload.preferredContact ?? "phone";
  return [
    "Нова заявка з сайту",
    `Імʼя: ${payload.name}`,
    `Телефон: ${payload.phone}`,
    `Email: ${payload.email || "—"}`,
    `Бюджет: ${budget}`,
    `Канал звʼязку: ${preferredContact}`,
    `Повідомлення: ${message}`,
    `Файл: ${fileUrl || "—"}`,
  ].join("\n");
}

export async function sendToTelegram(
  payload: LeadPayload,
  context: IntegrationContext
): Promise<void> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
    }

    console.log("[telegram.service] send start");
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: buildMessage(payload, context.fileUrl),
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Telegram error: ${response.status} ${body}`);
    }

    console.log("[telegram.service] sent");
  } catch (error) {
    const normalizedError = toError(
      error,
      "Unknown Telegram integration error"
    );
    console.error("[telegram.service] failed:", normalizedError);
    throw normalizedError;
  }
}
