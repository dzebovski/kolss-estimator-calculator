"use server";

import { getIntegrationStatus } from "@/lib/config/env.validation";
import {
  estimatorContactSchema,
  type EstimatorFormValues,
} from "@/lib/validation/estimator-contact";
import { saveLeadToDatabase } from "@/services/db/leads.service";
import { sendToPipedrive } from "@/services/integrations/pipedrive.service";
import { sendToSlack } from "@/services/integrations/slack.service";
import { sendToTelegram } from "@/services/integrations/telegram.service";
import type { IntegrationContext } from "@/services/integrations/types";

export type EstimatorContactActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  warnings?: string[];
  integrationStatus?: {
    pipedrive: { enabled: boolean; success: boolean; error?: string };
    telegram: { enabled: boolean; success: boolean; error?: string };
    slack: { enabled: boolean; success: boolean; error?: string };
  };
};

const MESSAGES = {
  validationInvalid: "Please check your entries and try again.",
  submitFailed:
    "Something went wrong while submitting the form. Please try again.",
  successFull:
    "Thank you! We have received your request and will contact you soon.",
  successPartial:
    "Your request was saved. Some notifications could not be sent; we will still contact you.",
  warningFailedIntegrations: (integrations: string) =>
    `Failed to deliver notification to: ${integrations}`,
  warningNoIntegrations:
    "No integrations are configured; the lead was saved to the database only.",
} as const;

function mapToLeadPayload(data: EstimatorFormValues) {
  const messageParts = [data.city, data.country, data.comment].filter(
    (s) => s != null && s.trim() !== ""
  );
  const message = messageParts.length > 0 ? messageParts.join(", ") : "";
  return {
    name: data.fullName.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || null,
    message: message || null,
    preferredContact: "phone" as const,
    budget: "",
  };
}

export async function submitEstimatorLead(
  data: EstimatorFormValues
): Promise<EstimatorContactActionState> {
  try {
    const validated = estimatorContactSchema.safeParse(data);

    if (!validated.success) {
      const fieldErrors = validated.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      return {
        success: false,
        message: MESSAGES.validationInvalid,
        errors: fieldErrors,
      };
    }

    const payload = mapToLeadPayload(validated.data);
    const context: IntegrationContext = { fileUrl: null };

    // When ENABLE_LEAD_INTEGRATIONS=telegram only Telegram runs (CRM, Slack, DB skipped until re-enabled)
    const integrationMode =
      process.env.ENABLE_LEAD_INTEGRATIONS?.toLowerCase().trim() || "all";
    const telegramOnly = integrationMode === "telegram";

    const configuredIntegrations = getIntegrationStatus();

    const integrationPromises: Promise<void>[] = [];
    if (!telegramOnly && configuredIntegrations.pipedrive) {
      integrationPromises.push(sendToPipedrive(payload, context));
    }
    if (configuredIntegrations.telegram) {
      integrationPromises.push(sendToTelegram(payload, context));
    }
    if (!telegramOnly && configuredIntegrations.slack) {
      integrationPromises.push(sendToSlack(payload, context));
    }

    const results = await Promise.allSettled(integrationPromises);
    let resultIdx = 0;

    const integrationStatus = {
      pipedrive: {
        enabled: !telegramOnly && configuredIntegrations.pipedrive,
        success:
          !telegramOnly && configuredIntegrations.pipedrive
            ? results[resultIdx++].status === "fulfilled"
            : false,
        error: undefined as string | undefined,
      },
      telegram: {
        enabled: configuredIntegrations.telegram,
        success: configuredIntegrations.telegram
          ? results[resultIdx++].status === "fulfilled"
          : false,
        error: undefined as string | undefined,
      },
      slack: {
        enabled: !telegramOnly && configuredIntegrations.slack,
        success:
          !telegramOnly && configuredIntegrations.slack
            ? results[resultIdx++].status === "fulfilled"
            : false,
        error: undefined as string | undefined,
      },
    };

    resultIdx = 0;
    if (!telegramOnly && configuredIntegrations.pipedrive) {
      const result = results[resultIdx++];
      if (result.status === "rejected") {
        integrationStatus.pipedrive.error =
          result.reason?.message ?? String(result.reason);
        console.error(
          "[estimator-contact] pipedrive integration error:",
          integrationStatus.pipedrive.error
        );
      }
    }
    if (configuredIntegrations.telegram) {
      const result = results[resultIdx++];
      if (result.status === "rejected") {
        integrationStatus.telegram.error =
          result.reason?.message ?? String(result.reason);
        console.error(
          "[estimator-contact] telegram integration error:",
          integrationStatus.telegram.error
        );
      }
    }
    if (!telegramOnly && configuredIntegrations.slack) {
      const result = results[resultIdx++];
      if (result.status === "rejected") {
        integrationStatus.slack.error =
          result.reason?.message ?? String(result.reason);
        console.error(
          "[estimator-contact] slack integration error:",
          integrationStatus.slack.error
        );
      }
    }

    const savedToDb = telegramOnly
      ? false
      : await saveLeadToDatabase(payload, context);

    const warnings: string[] = [];
    const failedIntegrations: string[] = [];

    if (
      integrationStatus.pipedrive.enabled &&
      !integrationStatus.pipedrive.success
    ) {
      failedIntegrations.push("CRM");
    }
    if (
      integrationStatus.telegram.enabled &&
      !integrationStatus.telegram.success
    ) {
      failedIntegrations.push("Telegram");
    }
    if (integrationStatus.slack.enabled && !integrationStatus.slack.success) {
      failedIntegrations.push("Slack");
    }

    if (failedIntegrations.length > 0) {
      warnings.push(
        MESSAGES.warningFailedIntegrations(failedIntegrations.join(", "))
      );
    }

    const anyConfigured = Object.values(configuredIntegrations).some((v) => v);
    if (!anyConfigured && savedToDb) {
      warnings.push(MESSAGES.warningNoIntegrations);
    }

    return {
      success: true,
      message:
        failedIntegrations.length > 0
          ? MESSAGES.successPartial
          : MESSAGES.successFull,
      warnings: warnings.length > 0 ? warnings : undefined,
      integrationStatus,
    };
  } catch (error) {
    console.error("[estimator-contact] submit failed:", error);
    return {
      success: false,
      message: MESSAGES.submitFailed,
    };
  }
}
