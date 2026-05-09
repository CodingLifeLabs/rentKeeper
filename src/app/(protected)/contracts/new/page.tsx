"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Lock } from "lucide-react";
import Link from "next/link";
import { UploadDropzone } from "@/ui/components/contracts/upload-dropzone";
import { OcrReviewForm } from "@/ui/components/contracts/ocr-review-form";
import type { OcrJobResult, ContractFormData } from "@/types/ocr";

export default function NewContractPage() {
  const router = useRouter();
  const [ocrResult, setOcrResult] = useState<OcrJobResult | null>(null);
  const [submitError, setSubmitError] = useState<{
    message: string;
    isPlanLimit: boolean;
  } | null>(null);

  const handleOcrComplete = (result: OcrJobResult) => {
    setOcrResult(result);
    setSubmitError(null);
  };

  const handleConfirm = async (formData: ContractFormData) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: { ...formData, propertyId: "manual" },
          ocrResult: ocrResult?.result,
          originalFileUrl: null,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const err: { error?: string; code?: string } = await res.json();
        setSubmitError({
          message: err.error ?? "계약 등록에 실패했습니다.",
          isPlanLimit: res.status === 403 && err.code === "plan_limit",
        });
      }
    } catch {
      setSubmitError({ message: "계약 등록 중 오류가 발생했습니다.", isPlanLimit: false });
    }
  };

  const handleCancel = () => {
    setOcrResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          대시보드로 돌아가기
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A3C5E] flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">계약 등록</h1>
            <p className="text-sm text-slate-400">
              계약서 이미지를 업로드하면 AI가 자동 분석합니다
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <UploadDropzone onOcrComplete={handleOcrComplete} />

        {submitError && (
          <div
            className={`rounded-xl p-4 text-sm flex items-start gap-3 ${
              submitError.isPlanLimit
                ? "bg-amber-50 border border-amber-200 text-amber-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            {submitError.isPlanLimit && <Lock size={16} className="mt-0.5 shrink-0" />}
            <div className="flex-1">
              <p className="font-medium">{submitError.message}</p>
              {submitError.isPlanLimit && (
                <Link
                  href="/pricing"
                  className="inline-block mt-2 text-xs font-semibold text-white bg-[#1A3C5E] hover:bg-[#2a5280] px-3 py-1.5 rounded-lg transition-colors"
                >
                  플랜 업그레이드 →
                </Link>
              )}
            </div>
          </div>
        )}

        {ocrResult && ocrResult.result && (
          <OcrReviewForm
            ocrResult={ocrResult}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
