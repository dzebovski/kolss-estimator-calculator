"use client";

import React from "react";
import { useEstimator } from "./estimator-root";
import { HIDE_PRICES, HIDE_STEP_4 } from "@/lib/estimator/config";
import { Currency } from "@/lib/estimator/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";

export function EstimatorHeader() {
  const { state, dispatch } = useEstimator();

  const TOTAL_STEPS = HIDE_STEP_4 ? 5 : HIDE_PRICES ? 6 : 7;
  const displayStep =
    HIDE_STEP_4 && state.currentStep >= 6
      ? state.currentStep - 2
      : HIDE_PRICES && state.currentStep > 4
        ? state.currentStep - 1
        : state.currentStep;

  const handleCurrencyChange = (value: string) => {
    if (value === "EUR" || value === "PLN") {
      dispatch({ type: "SET_CURRENCY", payload: value as Currency });
    }
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border sticky top-0 z-40 w-full border-b shadow-sm backdrop-blur">
      <div
        className={`container mx-auto flex h-16 items-center px-4 ${HIDE_PRICES ? "justify-center" : "justify-between"}`}
      >
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold tracking-tighter">
            <span className="text-primary">KOLSS</span> Quick Kitchen Project
          </div>
          <Badge
            variant="outline"
            className="bg-muted/50 border-primary/20 text-primary hidden rounded-full font-semibold md:inline-flex"
          >
            Step {displayStep} of {TOTAL_STEPS}
          </Badge>
        </div>

        {!HIDE_PRICES && (
          <div className="flex items-center space-x-3">
            <span className="text-muted-foreground hidden text-sm font-medium sm:inline-block">
              Currency
            </span>
            <ToggleGroup
              type="single"
              value={state.currency}
              onValueChange={handleCurrencyChange}
              className="bg-muted rounded-full border p-1"
            >
              <ToggleGroupItem
                value="EUR"
                aria-label="Toggle EUR"
                className="data-[state=on]:bg-background data-[state=on]:text-foreground h-8 rounded-full px-4 text-xs font-bold data-[state=on]:shadow-sm"
              >
                EUR
              </ToggleGroupItem>
              <ToggleGroupItem
                value="PLN"
                aria-label="Toggle PLN"
                className="data-[state=on]:bg-background data-[state=on]:text-foreground h-8 rounded-full px-4 text-xs font-bold data-[state=on]:shadow-sm"
              >
                PLN
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </div>
      {/* Progress Bar */}
      <div className="bg-muted h-1 w-full">
        <div
          className="bg-primary h-full transition-all duration-300 ease-in-out"
          style={{ width: `${(displayStep / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </header>
  );
}
