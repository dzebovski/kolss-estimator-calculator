import {
  KitchenSizeTier,
  KitchenLayout,
  FacadeSeries,
  HandleStyle,
  FacadeMaterial,
  CountertopMaterial,
  AdditionalService,
} from "./types";

/** When true, hide all price UI and summary step so it can be restored by flipping to false. */
export const HIDE_PRICES = true;

/** When true, skip step 4 (Additional Services & Assembly) so it can be restored later. */
export const HIDE_STEP_4 = true;

// Base conversion rate
export const EXCHANGE_RATE_EUR_TO_PLN = 4.3;

export const BASE_PRICE_PER_STEP_EUR = 600; // per 0.5 sq.m
export const SLIDER_STEP_SQM = 0.5;

export const SIZE_SLIDER_CONFIG = {
  min: 0.5,
  max: 8.0,
  step: 0.5,
};

// Brackets logic for syncing slider with the 3 size cards
export const SIZE_BRACKETS: Record<
  KitchenSizeTier,
  {
    min: number;
    max: number;
    default: number;
    label: string;
    description: string;
  }
> = {
  small: {
    min: 0.5,
    max: 3.5,
    default: 3.5,
    label: "Small kitchen",
    description: "Up to 3.5m² of space",
  },
  medium: {
    min: 4.0,
    max: 5.5,
    default: 5.5,
    label: "Medium kitchen",
    description: "4.0m² – 5.5m²",
  },
  large: {
    min: 6.0,
    max: 8.0,
    default: 8.0,
    label: "Large kitchen",
    description: "6.0m² – 8.0m²",
  },
};

export const LAYOUT_PRICING: Record<
  KitchenLayout,
  { label: string; priceEur: number; image: string }
> = {
  straight: {
    label: "Straight layout",
    priceEur: 0,
    image: "/kitchen-i-shape-icon.svg",
  },
  "l-shape": {
    label: "L-Shape layout",
    priceEur: 480,
    image: "/kitchen-l-shape-icon.svg",
  },
  "u-shape": {
    label: "U-Shape layout",
    priceEur: 960,
    image: "/kitchen-u-shape-icon.svg",
  },
};

export const ISLAND_PRICE_EUR = 1200;

// --- STEP 2: Facade & Handles ---
export const FACADE_SERIES_LABELS: Record<FacadeSeries, string> = {
  light: "Light Series",
  prestige: "Prestige Series",
};

/** Human-readable facade label for summary/notifications: "Light: Solid Wood" or "Prestige: PB Veneer" */
export function getFacadeDisplayLabel(materialId: string | undefined): string {
  if (!materialId) return "—";
  const material = FACADE_MATERIALS.find((m) => m.id === materialId);
  if (!material) return materialId;
  const seriesLabel = FACADE_SERIES_LABELS[material.series];
  return `${seriesLabel}: ${material.name}`;
}

export const FACADE_MATERIALS: FacadeMaterial[] = [
  // Light Series
  {
    id: "light-pb-painted",
    series: "light",
    name: "PB Painted",
    description: "Painted particle board, available in various colors.",
    pricePerSqmEur: 120,
  },
  {
    id: "light-pb-veneer",
    series: "light",
    name: "PB Veneer",
    description: "Particle board with natural wood veneer.",
    pricePerSqmEur: 160,
  },
  {
    id: "light-solid-wood",
    series: "light",
    name: "Solid Wood",
    description: "Natural solid wood finish.",
    pricePerSqmEur: 220,
  },

  // Prestige Series
  {
    id: "prestige-pb-veneer",
    series: "prestige",
    name: "PB Veneer",
    description: "Premium particle board with natural wood veneer.",
    pricePerSqmEur: 280,
  },
  {
    id: "prestige-solid-wood",
    series: "prestige",
    name: "Solid Wood",
    description: "Luxury natural solid wood finish.",
    pricePerSqmEur: 350,
  },
];

export const HANDLE_STYLES: Record<
  HandleStyle,
  { label: string; priceEur: number; description: string }
> = {
  surface: {
    label: "Surface Handles",
    priceEur: 0,
    description: "Included in base price",
  },
  hidden: {
    label: "Hidden / Profile Handles",
    priceEur: 300,
    description: "Sleek, modern look without visible handles",
  },
};

// --- STEP 3: Countertop ---
export const COUNTERTOP_MATERIALS: CountertopMaterial[] = [
  {
    id: "laminate",
    name: "Laminate",
    description: "Cost-effective, versatile patterns.",
    pricePerSqmEur: 50,
  },
  {
    id: "solid-wood",
    name: "Solid Wood",
    description: "Warm, natural aesthetic.",
    pricePerSqmEur: 150,
  },
  {
    id: "compact-hpl",
    name: "Compact HPL",
    description: "Thin, highly durable, waterproof.",
    pricePerSqmEur: 180,
  },
  {
    id: "composite-stone",
    name: "Composite Stone",
    description: "Quartz-based, highly resistant.",
    pricePerSqmEur: 300,
  },
  {
    id: "natural-stone",
    name: "Natural Stone",
    description: "Granite or marble, unique patterns.",
    pricePerSqmEur: 450,
  },
];

// --- STEP 4: Appliances & Assembly ---
export const ADDITIONAL_SERVICES: AdditionalService[] = [
  {
    id: "plumbing",
    name: "Plumbing Service",
    description: "Sink and dishwasher connection.",
    priceEur: 250,
  },
  {
    id: "electrical",
    name: "Electrical Service",
    description: "Oven, hob, and lighting connection.",
    priceEur: 250,
  },
];

export const ASSEMBLY_PRICE_PER_SQM_EUR = 100;

export const INITIAL_STATE = {
  currentStep: 1,
  currency: "EUR" as const,

  // Step 1
  sizeTier: "small" as KitchenSizeTier,
  floorArea: SIZE_BRACKETS.small.default,
  layout: "straight" as KitchenLayout,
  hasIsland: false,

  // Step 2
  facadeSeries: "light" as FacadeSeries,
  facadeMaterialId: "light-pb-painted",
  handleStyle: "surface" as HandleStyle,

  // Step 3
  countertopId: "laminate",

  // Step 4
  services: [],
  needsAssembly: false,
};
