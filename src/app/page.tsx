import { EstimatorProvider } from "@/components/estimator/estimator-root";
import { EstimatorCalculator } from "@/components/estimator/estimator-calculator";

export default function Home() {
  return (
    <EstimatorProvider>
      <EstimatorCalculator />
    </EstimatorProvider>
  );
}
