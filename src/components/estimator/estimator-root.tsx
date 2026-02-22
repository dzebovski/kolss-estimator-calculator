"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from "react";
import {
  EstimatorState,
  EstimatorAction,
  KitchenSizeTier,
} from "@/lib/estimator/types";
import { INITIAL_STATE, SIZE_BRACKETS } from "@/lib/estimator/config";

// Combine actions
type RootAction =
  | EstimatorAction
  | { type: "HYDRATE"; payload: EstimatorState };

function estimatorReducer(
  state: EstimatorState,
  action: RootAction
): EstimatorState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 7) };
    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    case "SET_CURRENCY":
      return { ...state, currency: action.payload };

    case "UPDATE_STEP_1": {
      const payload = action.payload;

      // If we only passed sizeTier, snap floorArea. If we only passed floorArea, detect sizeTier.
      let newSizeTier = payload.sizeTier ?? state.sizeTier;
      let newFloorArea = payload.floorArea ?? state.floorArea;

      if (payload.floorArea !== undefined && payload.sizeTier === undefined) {
        // Slider moved: auto-detect bracket
        if (newFloorArea <= SIZE_BRACKETS.small.max) newSizeTier = "small";
        else if (newFloorArea <= SIZE_BRACKETS.medium.max)
          newSizeTier = "medium";
        else newSizeTier = "large";
      } else if (
        payload.sizeTier !== undefined &&
        payload.floorArea === undefined
      ) {
        // Bracket clicked: snap slider to default (max)
        newFloorArea = SIZE_BRACKETS[newSizeTier].default;
      }

      return {
        ...state,
        ...payload,
        sizeTier: newSizeTier,
        floorArea: newFloorArea,
      };
    }

    case "UPDATE_STEP_2":
      return { ...state, ...action.payload };
    case "UPDATE_STEP_3":
      return { ...state, ...action.payload };
    case "UPDATE_STEP_4":
      return { ...state, ...action.payload };
    case "RESET":
      return { ...INITIAL_STATE, currency: state.currency }; // Keep user currency choice
    default:
      return state;
  }
}

interface EstimatorContextType {
  state: EstimatorState;
  dispatch: React.Dispatch<RootAction>;
}

const EstimatorContext = createContext<EstimatorContextType | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "kolss_estimator_state";

export function EstimatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    estimatorReducer,
    INITIAL_STATE as EstimatorState
  );

  // Hydrate on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as EstimatorState;
        // Basic validation that shape is somewhat correct
        if (parsed.currentStep !== undefined) {
          dispatch({ type: "HYDRATE", payload: parsed });
        }
      } catch (e) {
        console.error("Failed to parse estimator state from localStorage");
      }
    }
  }, []);

  // Save on state change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <EstimatorContext.Provider value={{ state, dispatch }}>
      {children}
    </EstimatorContext.Provider>
  );
}

export function useEstimator() {
  const context = useContext(EstimatorContext);
  if (!context) {
    throw new Error("useEstimator must be used within an EstimatorProvider");
  }
  return context;
}
