"use client";

import React from "react";
import { useEstimator } from "./estimator-root";
import { HIDE_PRICES, HIDE_STEP_4 } from "@/lib/estimator/config";
import { cn } from "@/lib/utils";
import { clearContactFormDraft } from "@/lib/estimator/contact-form-draft";
import { formatCurrency } from "@/lib/estimator/currency";
import { calculateTotalEur } from "@/lib/estimator/pricing";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

export function EstimatorFooter() {
  const { state, dispatch } = useEstimator();

  const handleNext = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  const handleBack = () => {
    dispatch({ type: "PREV_STEP" });
  };

  const handleReset = () => {
    clearContactFormDraft();
    dispatch({ type: "RESET" });
  };

  const isFirstStep = state.currentStep === 1;
  const isLastStep = state.currentStep === 7;
  const isFormStep = state.currentStep === 6;
  const showGetQuote =
    (state.currentStep === 3 && HIDE_STEP_4) ||
    (state.currentStep === 4 && HIDE_PRICES) ||
    (state.currentStep === 5 && !HIDE_PRICES);

  if (isLastStep) return null;

  const totalEur = calculateTotalEur(state);
  const formattedTotal = formatCurrency(totalEur, state.currency);

  return (
    <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-border animate-in slide-in-from-bottom-6 fixed right-0 bottom-0 left-0 z-40 border-t p-4 shadow-2xl backdrop-blur duration-300 md:px-8 md:py-6">
      <div
        className={cn(
          "container mx-auto flex flex-col items-center gap-4 md:flex-row",
          HIDE_PRICES
            ? "justify-center md:justify-center"
            : "justify-between md:justify-between"
        )}
      >
        {!HIDE_PRICES && (
          <div className="order-2 flex flex-1 flex-col text-center md:order-1 md:text-left">
            <div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
              <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Current Estimate
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground h-auto px-1.5 py-0.5 text-[10px] uppercase transition-colors"
                title="Reset Calculation"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset
              </Button>
            </div>
            <div className="text-foreground text-3xl font-black tracking-tight tabular-nums">
              {formattedTotal}
            </div>
          </div>
        )}

        <div className="order-1 flex w-full items-center justify-center gap-3 md:order-2 md:w-auto md:justify-center">
          {!isFirstStep && (
            <Button
              variant="outline"
              size="lg"
              className="h-14 flex-1 border-2 text-base font-semibold md:flex-none"
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
          )}

          {!isFormStep && (
            <Button
              size="lg"
              className="h-14 flex-1 px-8 text-base font-bold shadow-lg transition-all hover:shadow-xl md:flex-none"
              onClick={handleNext}
            >
              {showGetQuote ? "Get Quote" : "Next Step"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
