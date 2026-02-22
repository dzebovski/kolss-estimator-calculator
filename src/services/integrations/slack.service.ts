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

export async function sendToSlack(
  payload: LeadPayload,
  context: IntegrationContext
): Promise<void> {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error("Missing SLACK_WEBHOOK_URL");
    }

    const message = payload.message ?? "";
    const budget = payload.budget ?? "—";
    const preferredContact = payload.preferredContact ?? "phone";

    console.log("[slack.service] send start");
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: `Нова заявка: ${payload.name} (${payload.phone})`,
        blocks: [
          {
            type: "section",
            text: { type: "mrkdwn", text: "*Нова заявка з сайту*" },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Імʼя*\n${payload.name}` },
              { type: "mrkdwn", text: `*Телефон*\n${payload.phone}` },
              { type: "mrkdwn", text: `*Email*\n${payload.email || "—"}` },
              { type: "mrkdwn", text: `*Бюджет*\n${budget}` },
              { type: "mrkdwn", text: `*Канал*\n${preferredContact}` },
            ],
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: `*Повідомлення*\n${message}` },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Файл*\n${context.fileUrl ? `<${context.fileUrl}|Відкрити файл>` : "—"}`,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Slack error: ${response.status} ${body}`);
    }

    console.log("[slack.service] sent");
  } catch (error) {
    const normalizedError = toError(error, "Unknown Slack integration error");
    console.error("[slack.service] failed:", normalizedError);
    throw normalizedError;
  }
}
