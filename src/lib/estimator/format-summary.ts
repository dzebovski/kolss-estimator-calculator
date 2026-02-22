import {
  SIZE_BRACKETS,
  LAYOUT_PRICING,
  getFacadeDisplayLabel,
  HANDLE_STYLES,
  COUNTERTOP_MATERIALS,
  ADDITIONAL_SERVICES,
} from "./config";
import { formatCurrency } from "./currency";
import { calculateTotalEur, calculateTotalPln } from "./pricing";
import type { EstimatorState } from "./types";

/**
 * Builds a plain-text summary of the estimator choices for notifications (Telegram, Slack, etc.).
 * Used only on the server when submitting the contact form.
 */
export function formatEstimatorSummary(state: EstimatorState): string {
  const sizeLabel = SIZE_BRACKETS[state.sizeTier]?.label ?? state.sizeTier;
  const layoutLabel = LAYOUT_PRICING[state.layout]?.label ?? state.layout;
  const facadeName = getFacadeDisplayLabel(state.facadeMaterialId);
  const handleLabel =
    state.handleStyle && HANDLE_STYLES[state.handleStyle]
      ? HANDLE_STYLES[state.handleStyle].label
      : "—";
  const countertopName =
    COUNTERTOP_MATERIALS.find((m) => m.id === state.countertopId)?.name ??
    state.countertopId ??
    "—";
  const serviceNames =
    state.services?.length > 0
      ? state.services
          .map((id) => ADDITIONAL_SERVICES.find((s) => s.id === id)?.name ?? id)
          .join(", ")
      : "—";
  const totalEur = calculateTotalEur(state);
  const totalPln = calculateTotalPln(state);
  const totalFormatted =
    state.currency === "PLN"
      ? formatCurrency(totalPln, "PLN")
      : formatCurrency(totalEur, "EUR");

  const lines = [
    "——— Калькулятор ———",
    `Розмір: ${sizeLabel} (${state.floorArea.toFixed(1)} m²)`,
    `Планування: ${layoutLabel}`,
    state.hasIsland ? "Острів: так" : "Острів: ні",
    `Фасад: ${facadeName}`,
    `Ручки: ${handleLabel}`,
    `Стільниця: ${countertopName}`,
    `Додаткові послуги: ${serviceNames}`,
    `Збірка: ${state.needsAssembly ? "так" : "ні"}`,
    `Підсумок (${state.currency}): ${totalFormatted}`,
  ];
  return lines.join("\n");
}
