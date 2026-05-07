"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { UploadDropzone } from "@/ui/components/contracts/upload-dropzone";
import { OcrReviewForm } from "@/ui/components/contracts/ocr-review-form";
import type { OcrJobResult, ContractFormData } from "@/types/ocr";

export default function NewContractPage() {
  const router = useRouter();
  const [ocrResult, setOcrResult] = useState<OcrJobResult | null>(null);

  const handleOcrComplete = (result: OcrJobResult) => {
    setOcrResult(result);
  };

  const handleConfirm = async (formData: ContractFormData) => {
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
        const err = await res.json();
        alert(err.error ?? "계약 등록에 실패했습니다.");
      }
    } catch {
      alert("계약 등록 중 오류가 발생했습니다.");
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
