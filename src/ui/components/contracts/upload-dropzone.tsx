"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/config/utils";
import type { OcrJobResult } from "@/types/ocr";

interface UploadDropzoneProps {
  onOcrComplete: (result: OcrJobResult) => void;
}

export function UploadDropzone({ onOcrComplete }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        setError("지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP, PDF)");
        setIsProcessing(false);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("파일 크기는 10MB 이하여야 합니다.");
        setIsProcessing(false);
        return;
      }

      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreview(url);
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/ocr", {
          method: "POST",
          body: formData,
        });

        const result: OcrJobResult = await res.json();

        if (!res.ok) {
          setError((result as unknown as { error: string }).error ?? "OCR 처리에 실패했습니다.");
          return;
        }

        onOcrComplete(result);
      } catch {
        setError("OCR 처리 중 오류가 발생했습니다.");
      } finally {
        setIsProcessing(false);
      }
    },
    [onOcrComplete],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const clearPreview = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-2xl border-2 border-dashed transition-colors",
        isDragOver
          ? "border-[#00C896] bg-[#00C896]/5"
          : "border-slate-200 hover:border-slate-300",
        preview ? "p-4" : "p-12",
      )}
    >
      {preview && !isProcessing && (
        <button
          onClick={clearPreview}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <X size={16} />
        </button>
      )}

      {preview ? (
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="계약서 미리보기"
            className="max-h-64 rounded-xl object-contain"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
            <Upload size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">
            계약서 이미지를 드래그하세요
          </p>
          <p className="text-xs text-slate-400 mb-4">
            JPEG, PNG, WebP, PDF (최대 10MB)
          </p>
        </div>
      )}

      {isProcessing && (
        <div className="absolute inset-0 bg-white/80 rounded-2xl flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="text-[#1A3C5E] animate-spin" />
          <p className="text-sm font-medium text-slate-600">
            AI가 계약서를 분석 중...
          </p>
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />

      {error && (
        <p className="text-xs text-[#FF4D4D] mt-3 text-center font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
