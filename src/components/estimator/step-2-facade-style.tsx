"use client";

import React, { useMemo } from "react";
import { useEstimator } from "./estimator-root";
import { OptionCard } from "./option-card";
import {
  FACADE_MATERIALS,
  HANDLE_STYLES,
  FACADE_SERIES_LABELS,
  HIDE_PRICES,
} from "@/lib/estimator/config";
import { FacadeSeries, HandleStyle } from "@/lib/estimator/types";
import { formatCurrency } from "@/lib/estimator/currency";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function Step2FacadeStyle() {
  const { state, dispatch } = useEstimator();

  const handleSeriesChange = (series: string) => {
    // When switching series, automatically select the first material in that series
    const firstMaterial = FACADE_MATERIALS.find((m) => m.series === series);
    dispatch({
      type: "UPDATE_STEP_2",
      payload: {
        facadeSeries: series as FacadeSeries,
        facadeMaterialId: firstMaterial?.id,
      },
    });
  };

  const handleMaterialSelect = (materialId: string) => {
    dispatch({
      type: "UPDATE_STEP_2",
      payload: { facadeMaterialId: materialId },
    });
  };

  const handleHandleStyleSelect = (handleStyle: HandleStyle) => {
    dispatch({ type: "UPDATE_STEP_2", payload: { handleStyle } });
  };

  const currentSeriesMaterials = useMemo(() => {
    return FACADE_MATERIALS.filter((m) => m.series === state.facadeSeries);
  }, [state.facadeSeries]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      {/* 1. Facade Material */}
      <section>
        <h2 className="text-foreground mb-4 text-xl font-semibold">
          1. Facade Material
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          {HIDE_PRICES
            ? "Select a finish series and material for your kitchen cabinets."
            : `Select a finish series and material for your kitchen cabinets. Price depends on kitchen size (${state.floorArea.toFixed(1)} m²).`}
        </p>

        <Tabs
          value={state.facadeSeries}
          onValueChange={handleSeriesChange}
          className="w-full"
        >
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="light">
              {FACADE_SERIES_LABELS.light}
            </TabsTrigger>
            <TabsTrigger value="prestige">
              {FACADE_SERIES_LABELS.prestige}
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {currentSeriesMaterials.map((material) => {
              const totalMaterialPrice =
                material.pricePerSqmEur * state.floorArea;
              return (
                <OptionCard
                  key={material.id}
                  id={material.id}
                  title={material.name}
                  description={material.description}
                  priceDelta={
                    !HIDE_PRICES
                      ? `+${formatCurrency(totalMaterialPrice, state.currency)}`
                      : undefined
                  }
                  selected={state.facadeMaterialId === material.id}
                  onSelect={() => handleMaterialSelect(material.id)}
                />
              );
            })}
          </div>
        </Tabs>
      </section>

      {/* 2. Handle Style */}
      <section>
        <h2 className="text-foreground mb-4 text-xl font-semibold">
          2. Handle Style
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(
            Object.entries(HANDLE_STYLES) as [
              HandleStyle,
              (typeof HANDLE_STYLES)[HandleStyle],
            ][]
          ).map(([style, config]) => (
            <OptionCard
              key={style}
              id={style}
              title={config.label}
              description={config.description}
              priceDelta={
                !HIDE_PRICES
                  ? config.priceEur > 0
                    ? `+${formatCurrency(config.priceEur, state.currency)}`
                    : "Included"
                  : undefined
              }
              selected={state.handleStyle === style}
              onSelect={() => handleHandleStyleSelect(style)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
