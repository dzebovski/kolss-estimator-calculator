"use client";

import React from "react";
import { useEstimator } from "./estimator-root";
import { OptionCard } from "./option-card";
import {
  SIZE_BRACKETS,
  LAYOUT_PRICING,
  HIDE_PRICES,
  SIZE_SLIDER_CONFIG,
  ISLAND_PRICE_EUR,
} from "@/lib/estimator/config";
import { KitchenLayout, KitchenSizeTier } from "@/lib/estimator/types";
import { formatCurrency } from "@/lib/estimator/currency";
import { calculateBasePriceEur } from "@/lib/estimator/pricing";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function Step1SizeLayout() {
  const { state, dispatch } = useEstimator();

  const handleSizeTierSelect = (tier: KitchenSizeTier) => {
    dispatch({ type: "UPDATE_STEP_1", payload: { sizeTier: tier } });
  };

  const handleSliderChange = (vals: number[]) => {
    dispatch({ type: "UPDATE_STEP_1", payload: { floorArea: vals[0] } });
  };

  const handleLayoutSelect = (layout: KitchenLayout) => {
    dispatch({ type: "UPDATE_STEP_1", payload: { layout } });
  };

  const handleIslandToggle = (checked: boolean) => {
    dispatch({ type: "UPDATE_STEP_1", payload: { hasIsland: checked } });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      {/* 1. Size Tiers */}
      <section>
        <h2 className="text-foreground mb-4 text-xl font-semibold">
          1. Kitchen Size
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          {HIDE_PRICES
            ? "Select an approximate size for your kitchen."
            : "Select an approximate size or use the slider for an exact measurement."}
        </p>
        <div
          className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${!HIDE_PRICES ? "mb-8" : ""}`}
        >
          {(
            Object.entries(SIZE_BRACKETS) as [
              KitchenSizeTier,
              (typeof SIZE_BRACKETS)[KitchenSizeTier],
            ][]
          ).map(([tier, config]) => {
            const isSelected = state.sizeTier === tier;
            const displayPrice = isSelected
              ? calculateBasePriceEur(state.floorArea)
              : calculateBasePriceEur(config.min);
            const priceLabel = isSelected
              ? formatCurrency(displayPrice, state.currency)
              : `From ${formatCurrency(displayPrice, state.currency)}`;
            return (
              <OptionCard
                key={tier}
                id={tier}
                title={config.label}
                description={config.description}
                priceDelta={!HIDE_PRICES ? priceLabel : undefined}
                selected={isSelected}
                onSelect={() => handleSizeTierSelect(tier)}
              />
            );
          })}
        </div>

        {!HIDE_PRICES && (
          <div className="px-2">
            <div className="mb-6 flex items-center justify-between">
              <Label className="text-base font-medium">Floor Area</Label>
              <div className="text-primary text-xl font-bold">
                {state.floorArea.toFixed(1)} m²
              </div>
            </div>
            <Slider
              min={SIZE_SLIDER_CONFIG.min}
              max={SIZE_SLIDER_CONFIG.max}
              step={SIZE_SLIDER_CONFIG.step}
              value={[state.floorArea]}
              onValueChange={handleSliderChange}
              className="mb-6"
            />
            <div className="text-muted-foreground flex justify-between px-1 text-xs font-medium">
              <span>{SIZE_SLIDER_CONFIG.min.toFixed(1)} m²</span>
              <span>{SIZE_SLIDER_CONFIG.max.toFixed(1)} m²</span>
            </div>
          </div>
        )}
      </section>

      {/* 2. Layout */}
      <section>
        <h2 className="text-foreground mb-4 text-xl font-semibold">
          2. Kitchen Layout
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(
            Object.entries(LAYOUT_PRICING) as [
              KitchenLayout,
              (typeof LAYOUT_PRICING)[KitchenLayout],
            ][]
          ).map(([layout, config]) => (
            <OptionCard
              key={layout}
              id={layout}
              title={config.label}
              image={config.image}
              priceDelta={
                !HIDE_PRICES
                  ? config.priceEur > 0
                    ? `+${formatCurrency(config.priceEur, state.currency)}`
                    : "Included"
                  : undefined
              }
              selected={state.layout === layout}
              onSelect={() => handleLayoutSelect(layout)}
            />
          ))}
        </div>
      </section>

      {/* 3. Island */}
      <section
        className="bg-muted/30 border-border/50 hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors md:p-6"
        onClick={() => handleIslandToggle(!state.hasIsland)}
      >
        <div className="space-y-1">
          <Label
            htmlFor="island-toggle"
            className="pointer-events-none flex items-center gap-2 text-base font-medium"
          >
            Add Kitchen Island
          </Label>
          <p className="text-muted-foreground pointer-events-none text-sm">
            A central island adds extra workspace and storage.
          </p>
          {!HIDE_PRICES && (
            <p className="text-primary pointer-events-none mt-2 font-bold">
              +{formatCurrency(ISLAND_PRICE_EUR, state.currency)}
            </p>
          )}
        </div>
        <Switch
          id="island-toggle"
          checked={state.hasIsland}
          onCheckedChange={handleIslandToggle}
          onClick={(e) => e.stopPropagation()}
        />
      </section>

      {/* 4. Hardware Info Block */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="text-primary h-4 w-4" />
        <AlertTitle className="text-primary font-semibold">
          Premium Hardware Included
        </AlertTitle>
        <AlertDescription className="text-muted-foreground mt-2">
          All our kitchens come with premium Blum hinges and drawer runners with
          soft-close mechanisms as standard. No hidden extra costs for quality.
        </AlertDescription>
      </Alert>
    </div>
  );
}
