"use client";

import { useState } from "react";
import { X, FileText, ChevronRight } from "lucide-react";
import { CLAUSE_CATEGORIES, CLAUSE_TEMPLATES } from "@/config/clause-templates";
import type { ClauseCategoryId } from "@/types/clause-template";

interface ClauseTemplatePickerProps {
  onInsert: (text: string) => void;
  onClose: () => void;
}

export function ClauseTemplatePicker({ onInsert, onClose }: ClauseTemplatePickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<ClauseCategoryId>(
    CLAUSE_CATEGORIES[0].id,
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const filteredTemplates = CLAUSE_TEMPLATES.filter(
    (t) => t.categoryId === selectedCategory,
  );

  const selectedTemplate = filteredTemplates.find((t) => t.id === selectedTemplateId) ?? null;

  function handleCategorySelect(id: ClauseCategoryId) {
    setSelectedCategory(id);
    setSelectedTemplateId(null);
  }

  function handleInsert() {
    if (!selectedTemplate) return;
    onInsert(selectedTemplate.text);
    onClose();
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Dialog */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1A3C5E] flex items-center justify-center">
              <FileText size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">특약 템플릿</h2>
              <p className="text-xs text-slate-400">원하는 항목을 선택하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="닫기"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* Body: categories + templates */}
        <div className="flex flex-1 overflow-hidden">
          {/* Category sidebar */}
          <div className="w-36 shrink-0 border-r border-slate-100 overflow-y-auto py-2">
            {CLAUSE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[#1A3C5E]/5 text-[#1A3C5E] font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-base leading-none">{cat.icon}</span>
                <span className="text-xs leading-tight">{cat.label}</span>
                {selectedCategory === cat.id && (
                  <ChevronRight size={12} className="ml-auto text-[#1A3C5E]" />
                )}
              </button>
            ))}
          </div>

          {/* Template list */}
          <div className="flex-1 overflow-y-auto py-2 px-1">
            {filteredTemplates.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-8">
                해당 카테고리에 템플릿이 없습니다.
              </p>
            ) : (
              <div className="space-y-1.5 p-2">
                {filteredTemplates.map((template) => {
                  const isSelected = template.id === selectedTemplateId;
                  return (
                    <button
                      key={template.id}
                      onClick={() =>
                        setSelectedTemplateId(isSelected ? null : template.id)
                      }
                      className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${
                        isSelected
                          ? "border-[#1A3C5E] bg-[#1A3C5E]/5"
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold mb-1 ${
                          isSelected ? "text-[#1A3C5E]" : "text-slate-700"
                        }`}
                      >
                        {template.title}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {template.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Preview + actions */}
        {selectedTemplate && (
          <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/60">
            <p className="text-xs font-semibold text-slate-500 mb-1.5">미리보기</p>
            <p className="text-xs text-slate-700 leading-relaxed mb-3 line-clamp-3">
              {selectedTemplate.text}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleInsert}
                className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg bg-[#1A3C5E] hover:bg-[#1A3C5E]/90 transition-colors"
              >
                삽입
              </button>
            </div>
          </div>
        )}

        {/* Empty footer when nothing selected */}
        {!selectedTemplate && (
          <div className="border-t border-slate-100 px-5 py-3 flex justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
