"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/config/utils";
import { Button } from "@/ui/components/ui/button";
import { Card, CardHeader, CardContent } from "@/ui/components/ui/card";
import type { OcrJobResult, ContractFormData } from "@/types/ocr";

interface OcrReviewFormProps {
  ocrResult: OcrJobResult;
  onConfirm: (formData: ContractFormData) => Promise<void>;
  onCancel: () => void;
}

function confidenceColor(confidence: number): string {
  if (confidence >= 0.9) return "text-[#00C896]";
  if (confidence >= 0.8) return "text-[#FF8C00]";
  return "text-[#FF4D4D]";
}

function confidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return "높음";
  if (confidence >= 0.8) return "보통";
  return "낮음";
}

const FIELD_CONFIG: Record<
  string,
  { label: string; type: "text" | "number" | "date" | "select"; options?: string[] }
> = {
  tenantName: { label: "임차인명", type: "text" },
  tenantPhone: { label: "연락처", type: "text" },
  deposit: { label: "보증금 (원)", type: "number" },
  monthlyRent: { label: "월세 (원)", type: "number" },
  startDate: { label: "계약시작일", type: "date" },
  endDate: { label: "계약종료일", type: "date" },
  contractType: {
    label: "계약유형",
    type: "select",
    options: ["월세", "전세"],
  },
};

const DEFAULT_FORM: ContractFormData = {
  propertyId: "",
  tenantName: "",
  tenantPhone: "",
  deposit: 0,
  monthlyRent: null,
  startDate: "",
  endDate: "",
  contractType: "월세",
  notes: null,
};

function buildInitialForm(fields: { key: string; value: string }[]): ContractFormData {
  const form: ContractFormData = { ...DEFAULT_FORM };
  for (const field of fields) {
    const key = field.key as keyof ContractFormData;
    if (key in form) {
      if (key === "deposit" || key === "monthlyRent") {
        (form[key] as number | null) = Number(field.value) || null;
      } else {
        (form[key] as string) = field.value;
      }
    }
  }
  return form;
}

export function OcrReviewForm({
  ocrResult,
  onConfirm,
  onCancel,
}: OcrReviewFormProps) {
  const [form, setForm] = useState<ContractFormData>(
    () => buildInitialForm(ocrResult.result?.fields ?? []),
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const result = ocrResult.result;
  const initialForm = useMemo(
    () => buildInitialForm(result?.fields ?? []),
    [result],
  );

  if (!result) return null;

  const overallConfidence = result.overallConfidence;
  const needsReview = overallConfidence < 0.8;

  const updateField = (key: string, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm({ ...form, notes: notes || null });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">OCR 분석 결과</h3>
          <div className="flex items-center gap-2">
            {needsReview ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF8C00] bg-[#FF8C00]/10 px-2.5 py-1 rounded-lg">
                <AlertTriangle size={14} />
                검토 필요 (신뢰도 {Math.round(overallConfidence * 100)}%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00C896] bg-[#00C896]/10 px-2.5 py-1 rounded-lg">
                <CheckCircle2 size={14} />
                신뢰도 {Math.round(overallConfidence * 100)}%
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.fields.map((field) => {
              const config = FIELD_CONFIG[field.key];
              if (!config) return null;

              return (
                <div key={field.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600">
                      {config.label}
                    </label>
                    <span
                      className={cn(
                        "text-[10px] font-bold",
                        confidenceColor(field.confidence),
                      )}
                    >
                      {confidenceLabel(field.confidence)}
                    </span>
                  </div>
                  {config.type === "select" ? (
                    <select
                      value={String(form[field.key as keyof ContractFormData] ?? "")}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] focus:border-transparent"
                    >
                      {config.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={config.type}
                      value={form[field.key as keyof ContractFormData] ?? ""}
                      onChange={(e) =>
                        updateField(
                          field.key,
                          config.type === "number"
                            ? Number(e.target.value) || null
                            : e.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] focus:border-transparent"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              특약사항 메모
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="특약사항이나 메모를 입력하세요"
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              취소
            </Button>
            <Button variant="secondary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  저장 중...
                </>
              ) : (
                "계약 등록"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
