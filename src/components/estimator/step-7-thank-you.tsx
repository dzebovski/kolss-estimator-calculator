"use client";

import React from "react";
import { useEstimator } from "./estimator-root";
import { HIDE_PRICES } from "@/lib/estimator/config";
import { clearContactFormDraft } from "@/lib/estimator/contact-form-draft";
import { formatCurrency } from "@/lib/estimator/currency";
import { calculateTotalEur, calculateTotalPln } from "@/lib/estimator/pricing";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";

export function Step7ThankYou() {
  const { state, dispatch } = useEstimator();

  const handleReset = () => {
    clearContactFormDraft();
    dispatch({ type: "RESET" });
  };

  const totalEur = calculateTotalEur(state);
  const totalPln = calculateTotalPln(state);

  return (
    <div className="animate-in zoom-in-95 fade-in mx-auto max-w-2xl space-y-8 py-10 text-center duration-500">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-4 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle2 className="h-16 w-16" />
        </div>
      </div>

      <div>
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight">
          Request Submitted!
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-lg text-lg leading-relaxed">
          Thank you for choosing KOLSS. Your kitchen estimate request has been
          successfully received.
        </p>
      </div>

      {/* Summary Card — hidden when prices are not shown */}
      {!HIDE_PRICES && (
        <Card className="border-border bg-muted/20 inline-block w-full max-w-md text-left shadow-sm">
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-2 text-center text-sm font-semibold tracking-wide uppercase">
              Your Initial Estimate
            </p>
            <div className="text-foreground mb-1 text-center text-4xl font-black">
              {formatCurrency(totalEur, "EUR")}
            </div>
            <p className="text-muted-foreground text-center text-sm">
              ~ {formatCurrency(totalPln, "PLN")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Next Steps List */}
      <div className="bg-muted/30 mx-auto mt-8 max-w-lg rounded-xl border p-6 text-left md:p-8">
        <h3 className="mb-4 text-lg font-semibold">What happens next?</h3>
        <ul className="space-y-4">
          <li className="flex items-start">
            <span className="bg-primary/10 text-primary mt-0.5 mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              1
            </span>
            <span className="text-muted-foreground">
              Our specialist will contact you shortly to review your selections
              and discuss details.
            </span>
          </li>
          <li className="flex items-start">
            <span className="bg-primary/10 text-primary mt-0.5 mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              2
            </span>
            <span className="text-muted-foreground">
              We&apos;ll schedule a precise measurement of your kitchen space.
            </span>
          </li>
          <li className="flex items-start">
            <span className="bg-primary/10 text-primary mt-0.5 mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              3
            </span>
            <span className="text-muted-foreground">
              You will receive a final, exact quote along with a 3D
              visualization.
            </span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button
          variant="outline"
          size="lg"
          className="h-12 w-full px-6 sm:w-auto"
          onClick={handleReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Calculate Again
        </Button>
        <Button size="lg" className="h-12 w-full px-6 sm:w-auto" asChild>
          <a href="https://kolss.eu" target="_blank" rel="noopener noreferrer">
            Visit kolss.eu
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>

      <p className="text-muted-foreground mt-8 text-sm">
        Need immediate assistance? Contact us at{" "}
        <a href="mailto:biuro@kolss.eu" className="font-semibold underline">
          biuro@kolss.eu
        </a>{" "}
        or{" "}
        <a href="tel:+48510700913" className="font-semibold underline">
          +48 510 700 913
        </a>
      </p>
    </div>
  );
}
