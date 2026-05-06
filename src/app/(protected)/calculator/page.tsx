import { RentCalculatorForm } from "@/ui/components/calculator/rent-calculator-form";

export default function CalculatorPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-800">월세 인상 계산기</h2>
        <p className="text-sm text-slate-400 mt-1">
          주택임대차보호법 기준 인상율 자동 계산
        </p>
      </div>
      <RentCalculatorForm />
    </div>
  );
}
