"use server";

import { headers } from "next/headers";
import { getIntegrationStatus } from "@/lib/config/env.validation";
import {
  estimatorContactSchema,
  type EstimatorFormValues,
} from "@/lib/validation/estimator-contact";
import { formatEstimatorSummary } from "@/lib/estimator/format-summary";
import type { EstimatorState } from "@/lib/estimator/types";
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
  rateLimited:
    "You have submitted too many requests. Please try again in a minute.",
  captchaFailed:
    "Security check failed. Please refresh the page and try again.",
} as const;

// In-memory rate limiter (per Vercel function instance)
// Clears naturally as lambda instances die, but we also clean it up manually
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRecord = rateLimitMap.get(ip);

  if (!userRecord) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (now - userRecord.timestamp > RATE_LIMIT_WINDOW_MS) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (userRecord.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userRecord.count += 1;
  return true;
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn(
      "TURNSTILE_SECRET_KEY is not set. Skipping CAPTCHA verification."
    );
    return true; // Skip verification if not configured yet (useful for initial setup)
  }

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
      }
    );

    const data = await res.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

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
  data: EstimatorFormValues,
  turnstileToken?: string,
  estimatorState?: EstimatorState | null
): Promise<EstimatorContactActionState> {
  try {
    // 1. Rate Limiting Check
    const headersList = await headers();
    // Vercel populates x-forwarded-for with the client's real IP
    const ip = headersList.get("x-forwarded-for") || "unknown-ip";

    if (!checkRateLimit(ip)) {
      console.warn(`[estimator-contact] Rate limited IP: ${ip}`);
      return {
        success: false,
        message: MESSAGES.rateLimited,
      };
    }

    // 2. Turnstile CAPTCHA Check
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return {
          success: false,
          message: MESSAGES.captchaFailed,
        };
      }

      const isCaptchaValid = await verifyTurnstileToken(turnstileToken);
      if (!isCaptchaValid) {
        return {
          success: false,
          message: MESSAGES.captchaFailed,
        };
      }
    }

    // 3. Validation
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
    const estimatorSummary =
      estimatorState != null ? formatEstimatorSummary(estimatorState) : null;
    const context: IntegrationContext = {
      fileUrl: null,
      estimatorSummary: estimatorSummary ?? null,
    };

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
