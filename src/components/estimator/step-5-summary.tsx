"use client";

import React from "react";
import { useEstimator } from "./estimator-root";
import { formatCurrency } from "@/lib/estimator/currency";
import {
  calculateTotalEur,
  calculateTotalPln,
  calculateLayoutPriceEur,
  calculateIslandPriceEur,
  calculateBasePriceEur,
  calculateFacadePriceEur,
  calculateHandlePriceEur,
  calculateCountertopPriceEur,
  calculateServicesPriceEur,
  calculateAssemblyPriceEur,
} from "@/lib/estimator/pricing";
import {
  LAYOUT_PRICING,
  getFacadeDisplayLabel,
  HANDLE_STYLES,
  COUNTERTOP_MATERIALS,
  ADDITIONAL_SERVICES,
} from "@/lib/estimator/config";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function Step5Summary() {
  const { state } = useEstimator();

  const basePriceEur = calculateBasePriceEur(state.floorArea);
  const layoutPriceEur = calculateLayoutPriceEur(state.layout);
  const islandPriceEur = calculateIslandPriceEur(state.hasIsland);

  const facadePriceEur = calculateFacadePriceEur(state);
  const handlePriceEur = calculateHandlePriceEur(state);
  const countertopPriceEur = calculateCountertopPriceEur(state);

  const assemblyPriceEur = calculateAssemblyPriceEur(state);

  const totalEur = calculateTotalEur(state);
  const totalPln = calculateTotalPln(state);

  const format = (eur: number) => formatCurrency(eur, state.currency);

  const getFacadeDisplayName = () => {
    return getFacadeDisplayLabel(state.facadeMaterialId) || "Unknown Material";
  };
  const getCountertopName = () => {
    return (
      COUNTERTOP_MATERIALS.find((m) => m.id === state.countertopId)?.name ||
      "Unknown Material"
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      <section>
        <h2 className="text-foreground mb-6 text-xl font-semibold">
          5. Summary
        </h2>
        <Card className="border-border/50 overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg">Your Kitchen Estimate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Configuration Group */}
            <div>
              <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                Configuration
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    Base Kitchen Size ({state.floorArea.toFixed(1)} m²)
                  </span>
                  <span className="font-medium">{format(basePriceEur)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    Layout: {LAYOUT_PRICING[state.layout].label}
                  </span>
                  <span className="font-medium">
                    {layoutPriceEur > 0
                      ? `+${format(layoutPriceEur)}`
                      : "Included"}
                  </span>
                </div>
                {state.hasIsland && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Kitchen Island</span>
                    <span className="font-medium">
                      +{format(islandPriceEur)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Finishes */}
            <div>
              <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                Finishes
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    Facade: {getFacadeDisplayName()}
                  </span>
                  <span className="font-medium">+{format(facadePriceEur)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    Handles:{" "}
                    {state.handleStyle
                      ? HANDLE_STYLES[state.handleStyle].label
                      : "None"}
                  </span>
                  <span className="font-medium">
                    {handlePriceEur > 0
                      ? `+${format(handlePriceEur)}`
                      : "Included"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    Countertop: {getCountertopName()}
                  </span>
                  <span className="font-medium">
                    +{format(countertopPriceEur)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Services */}
            <div>
              <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                Services & Assembly
              </h3>
              <div className="space-y-3">
                {state.services && state.services.length > 0 ? (
                  state.services.map((sId) => {
                    const serv = ADDITIONAL_SERVICES.find((s) => s.id === sId);
                    if (!serv) return null;
                    return (
                      <div
                        key={sId}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground">{serv.name}</span>
                        <span className="font-medium">
                          +{format(serv.priceEur)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground text-muted-foreground">
                      Extra Services
                    </span>
                    <span className="text-muted-foreground font-medium">
                      None selected
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">Kitchen Assembly</span>
                  <span className="font-medium">
                    {state.needsAssembly
                      ? `+${format(assemblyPriceEur)}`
                      : "Not included"}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-primary/20" />

            {/* Total Row */}
            <div className="pt-2">
              <div className="mb-1 flex items-end justify-between">
                <span className="text-foreground text-base font-bold">
                  Total Estimate
                </span>
                <span className="text-primary text-2xl font-black">
                  {formatCurrency(totalEur, "EUR")}
                </span>
              </div>
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>Approximate local currency equivalent</span>
                <span>{formatCurrency(totalPln, "PLN")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Info Notice */}
      <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-200">
        <Info className="h-4 w-4" />
        <AlertTitle className="font-semibold">Important Note</AlertTitle>
        <AlertDescription className="mt-2 text-sm leading-relaxed">
          This is an initial estimate based on your selections. Final pricing
          may vary after an exact measurement by our specialists and a detailed
          design review. Appliance costs are not included in this estimate.
        </AlertDescription>
      </Alert>
    </div>
  );
}
