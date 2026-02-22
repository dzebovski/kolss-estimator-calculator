export type Currency = "EUR" | "PLN";

export type KitchenSizeTier = "small" | "medium" | "large";
export type KitchenLayout = "straight" | "l-shape" | "u-shape";
export type FacadeSeries = "light" | "prestige";
export type HandleStyle = "surface" | "hidden";

export interface FacadeMaterial {
  id: string;
  series: FacadeSeries;
  name: string;
  description?: string;
  pricePerSqmEur: number;
}

export interface CountertopMaterial {
  id: string;
  name: string;
  description?: string;
  pricePerSqmEur: number;
}

export interface AdditionalService {
  id: string;
  name: string;
  description?: string;
  priceEur: number;
}

export interface EstimatorState {
  currentStep: number;
  currency: Currency;

  // Step 1
  sizeTier: KitchenSizeTier;
  floorArea: number; // Slider value in sq.m
  layout: KitchenLayout;
  hasIsland: boolean;

  // Step 2 (for future, but defined now to keep state shape stable)
  facadeSeries?: FacadeSeries;
  facadeMaterialId?: string;
  handleStyle?: HandleStyle;

  // Step 3
  countertopId?: string;

  // Step 4
  services: string[]; // e.g., 'plumbing', 'electrical'
  needsAssembly: boolean;
}

export type EstimatorAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_CURRENCY"; payload: Currency }
  | {
      type: "UPDATE_STEP_1";
      payload: Partial<
        Pick<EstimatorState, "sizeTier" | "floorArea" | "layout" | "hasIsland">
      >;
    }
  | {
      type: "UPDATE_STEP_2";
      payload: Partial<
        Pick<
          EstimatorState,
          "facadeSeries" | "facadeMaterialId" | "handleStyle"
        >
      >;
    }
  | {
      type: "UPDATE_STEP_3";
      payload: Partial<Pick<EstimatorState, "countertopId">>;
    }
  | {
      type: "UPDATE_STEP_4";
      payload: Partial<Pick<EstimatorState, "services" | "needsAssembly">>;
    }
  | { type: "RESET" };
