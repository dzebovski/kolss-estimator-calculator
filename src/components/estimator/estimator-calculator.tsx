"use client";

import React, { useEffect } from "react";
import { useEstimator } from "./estimator-root";
import { HIDE_PRICES, HIDE_STEP_4 } from "@/lib/estimator/config";
import { EstimatorHeader } from "./estimator-header";
import { EstimatorFooter } from "./estimator-footer";
import { Step1SizeLayout } from "./step-1-size-layout";
import { Step2FacadeStyle } from "./step-2-facade-style";
import { Step3Countertop } from "./step-3-countertop";
import { Step4Appliances } from "./step-4-appliances";
import { Step5Summary } from "./step-5-summary";
import { Step6Contact } from "./step-6-contact";
import { Step7ThankYou } from "./step-7-thank-you";

export function EstimatorCalculator() {
  const { state } = useEstimator();

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.currentStep]);

  return (
    <div className="selection:bg-primary/20 bg-background flex min-h-screen flex-col">
      <EstimatorHeader />

      <main className="relative container mx-auto mb-32 flex-1 px-4 py-8 md:py-12">
        <div className="mx-auto w-full max-w-4xl">
          {/* Step Router */}
          {state.currentStep === 1 && <Step1SizeLayout />}
          {state.currentStep === 2 && <Step2FacadeStyle />}
          {state.currentStep === 3 && <Step3Countertop />}
          {state.currentStep === 4 && !HIDE_STEP_4 && <Step4Appliances />}
          {state.currentStep === 5 && !HIDE_PRICES && <Step5Summary />}
          {state.currentStep === 6 && <Step6Contact />}
          {state.currentStep === 7 && <Step7ThankYou />}
        </div>
      </main>

      {state.currentStep !== 7 && <EstimatorFooter />}
    </div>
  );
}
