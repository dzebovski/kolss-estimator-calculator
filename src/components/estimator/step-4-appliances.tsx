"use client";

import React from "react";
import { useEstimator } from "./estimator-root";
import { OptionCard } from "./option-card";
import {
  ADDITIONAL_SERVICES,
  ASSEMBLY_PRICE_PER_SQM_EUR,
} from "@/lib/estimator/config";
import { formatCurrency } from "@/lib/estimator/currency";
import { calculateAssemblyPriceEur } from "@/lib/estimator/pricing";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

export function Step4Appliances() {
  const { state, dispatch } = useEstimator();

  const handleServiceToggle = (serviceId: string) => {
    const currentServices = state.services || [];
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter((id) => id !== serviceId)
      : [...currentServices, serviceId];

    dispatch({ type: "UPDATE_STEP_4", payload: { services: newServices } });
  };

  const handleAssemblyToggle = (checked: boolean) => {
    dispatch({ type: "UPDATE_STEP_4", payload: { needsAssembly: checked } });
  };

  const totalAssemblyPriceEur = state.floorArea * ASSEMBLY_PRICE_PER_SQM_EUR;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      {/* 1. Additional Services */}
      <section>
        <h2 className="text-foreground mb-4 text-xl font-semibold">
          1. Additional Services
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Select any extra services you need. You can choose multiple options.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ADDITIONAL_SERVICES.map((service) => (
            <OptionCard
              key={service.id}
              id={service.id}
              title={service.name}
              description={service.description}
              priceDelta={`+${formatCurrency(service.priceEur, state.currency)}`}
              selected={(state.services || []).includes(service.id)}
              onSelect={() => handleServiceToggle(service.id)}
            />
          ))}
        </div>
      </section>

      {/* 2. Kitchen Assembly */}
      <section
        className="bg-muted/30 border-border/50 hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors md:p-6"
        onClick={() => handleAssemblyToggle(!state.needsAssembly)}
      >
        <div className="space-y-1">
          <Label
            htmlFor="assembly-toggle"
            className="pointer-events-none text-base font-medium"
          >
            Kitchen Assembly
          </Label>
          <p className="text-muted-foreground pointer-events-none text-sm">
            Professional installation of furniture and worktops by our experts.
            Price depends on kitchen size ({state.floorArea.toFixed(1)} m²).
          </p>
          <p className="text-primary pointer-events-none mt-2 font-bold">
            +{formatCurrency(totalAssemblyPriceEur, state.currency)}
          </p>
        </div>
        <Switch
          id="assembly-toggle"
          checked={state.needsAssembly}
          onCheckedChange={handleAssemblyToggle}
          onClick={(e) => e.stopPropagation()}
        />
      </section>

      {/* Warranty Info Block */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="text-primary h-4 w-4" />
        <AlertTitle className="text-primary font-semibold">
          Full Warranty
        </AlertTitle>
        <AlertDescription className="text-muted-foreground mt-2">
          Choosing our professional assembly service extends the comprehensive
          warranty for your kitchen to 5 years, ensuring peace of mind.
        </AlertDescription>
      </Alert>
    </div>
  );
}
