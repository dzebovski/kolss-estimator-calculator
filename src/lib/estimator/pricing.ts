import {
  BASE_PRICE_PER_STEP_EUR,
  SLIDER_STEP_SQM,
  LAYOUT_PRICING,
  ISLAND_PRICE_EUR,
  EXCHANGE_RATE_EUR_TO_PLN,
  FACADE_MATERIALS,
  HANDLE_STYLES,
  COUNTERTOP_MATERIALS,
  ADDITIONAL_SERVICES,
  ASSEMBLY_PRICE_PER_SQM_EUR,
} from "./config";
import { EstimatorState } from "./types";
import { convertEurToPln } from "./currency";

// --- STEP 1 ---
export function calculateBasePriceEur(floorArea: number): number {
  const steps = floorArea / SLIDER_STEP_SQM;
  return steps * BASE_PRICE_PER_STEP_EUR;
}

export function calculateLayoutPriceEur(layout: string): number {
  return LAYOUT_PRICING[layout as keyof typeof LAYOUT_PRICING]?.priceEur || 0;
}

export function calculateIslandPriceEur(hasIsland: boolean): number {
  return hasIsland ? ISLAND_PRICE_EUR : 0;
}

// --- STEP 2 ---
export function calculateFacadePriceEur(state: EstimatorState): number {
  if (!state.facadeMaterialId) return 0;
  const material = FACADE_MATERIALS.find(
    (m) => m.id === state.facadeMaterialId
  );
  return material ? material.pricePerSqmEur * state.floorArea : 0;
}

export function calculateHandlePriceEur(state: EstimatorState): number {
  if (!state.handleStyle) return 0;
  return HANDLE_STYLES[state.handleStyle]?.priceEur || 0;
}

// --- STEP 3 ---
export function calculateCountertopPriceEur(state: EstimatorState): number {
  if (!state.countertopId) return 0;
  const material = COUNTERTOP_MATERIALS.find(
    (m) => m.id === state.countertopId
  );
  return material ? material.pricePerSqmEur * state.floorArea : 0;
}

// --- STEP 4 ---
export function calculateServicesPriceEur(state: EstimatorState): number {
  if (!state.services || state.services.length === 0) return 0;
  return state.services.reduce((total, sId) => {
    const s = ADDITIONAL_SERVICES.find((serv) => serv.id === sId);
    return total + (s ? s.priceEur : 0);
  }, 0);
}

export function calculateAssemblyPriceEur(state: EstimatorState): number {
  return state.needsAssembly ? state.floorArea * ASSEMBLY_PRICE_PER_SQM_EUR : 0;
}

// --- TOTALS ---
export function calculateTotalEur(state: EstimatorState): number {
  let total = 0;

  // Step 1
  total += calculateBasePriceEur(state.floorArea);
  total += calculateLayoutPriceEur(state.layout);
  total += calculateIslandPriceEur(state.hasIsland);

  // Step 2
  total += calculateFacadePriceEur(state);
  total += calculateHandlePriceEur(state);

  // Step 3
  total += calculateCountertopPriceEur(state);

  // Step 4
  total += calculateServicesPriceEur(state);
  total += calculateAssemblyPriceEur(state);

  return total;
}

export function calculateTotalPln(state: EstimatorState): number {
  const eur = calculateTotalEur(state);
  return convertEurToPln(eur, EXCHANGE_RATE_EUR_TO_PLN);
}

// Gives a nice object containing both values depending on state.currency
export function getTotalValue(state: EstimatorState): {
  valueEur: number;
  valuePln: number;
  displayValue: number;
} {
  const valueEur = calculateTotalEur(state);
  const valuePln = calculateTotalPln(state);

  return {
    valueEur,
    valuePln,
    displayValue: state.currency === "EUR" ? valueEur : valuePln,
  };
}
