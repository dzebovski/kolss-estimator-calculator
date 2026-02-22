"use client";

import React from "react";
import { useEstimator } from "./estimator-root";
import { OptionCard } from "./option-card";
import { COUNTERTOP_MATERIALS } from "@/lib/estimator/config";
import { formatCurrency } from "@/lib/estimator/currency";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function Step3Countertop() {
  const { state, dispatch } = useEstimator();

  const handleCountertopSelect = (materialId: string) => {
    dispatch({ type: "UPDATE_STEP_3", payload: { countertopId: materialId } });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      <section>
        <h2 className="text-foreground mb-4 text-xl font-semibold">
          Countertop Material
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Select a countertop material. The final price depends on your kitchen
          size ({state.floorArea.toFixed(1)} m²).
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {COUNTERTOP_MATERIALS.map((material) => {
            const totalPrice = material.pricePerSqmEur * state.floorArea;
            return (
              <OptionCard
                key={material.id}
                id={material.id}
                title={material.name}
                description={material.description}
                priceDelta={`+${formatCurrency(totalPrice, state.currency)}`}
                selected={state.countertopId === material.id}
                onSelect={() => handleCountertopSelect(material.id)}
              />
            );
          })}
        </div>
      </section>

      <Alert className="bg-primary/5 border-primary/20">
        <Info className="text-primary h-4 w-4" />
        <AlertTitle className="text-primary font-semibold">
          Expert Tip
        </AlertTitle>
        <AlertDescription className="text-muted-foreground mt-2">
          Composite and natural stone countertops offer the highest durability
          and resistance to heat and scratches, but require professional
          installation which is included in our assembly service.
        </AlertDescription>
      </Alert>
    </div>
  );
}
