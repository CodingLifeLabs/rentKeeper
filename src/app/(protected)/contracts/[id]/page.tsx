"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  X,
  Check,
  Upload,
  FileIcon,
  Download,
  Trash2,
  Mail,
  FileText,
  BookOpen,
} from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Card, CardContent } from "@/ui/components/ui/card";
import { CommunicationList } from "@/ui/components/communications/communication-list";
import { ClauseTemplatePicker } from "@/ui/components/contracts/clause-template-picker";
import type { Contract, ContractStatus } from "@/types/contract";
import type { Property } from "@/types/property";
import type { ContractUpdate } from "@/types/storage-file";

const STATUS_CONFIG: Record<
  ContractStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: "초안", color: "text-slate-400", bgColor: "bg-slate-50" },
  active: { label: "계약 중", color: "text-[#00C896]", bgColor: "bg-emerald-50" },
  expiring_90: { label: "D-90 만기", color: "text-[#FFB800]", bgColor: "bg-amber-50" },
  expiring_30: { label: "D-30 만기", color: "text-[#FF4D4D]", bgColor: "bg-red-50" },
  negotiating: { label: "협상 중", color: "text-[#8B5CF6]", bgColor: "bg-violet-50" },
  renewed: { label: "갱신 완료", color: "text-[#00C896]", bgColor: "bg-emerald-50" },
  move_out_pending: { label: "퇴거 예정", color: "text-orange-400", bgColor: "bg-orange-50" },
  vacant: { label: "공실", color: "text-slate-400", bgColor: "bg-slate-50" },
  archived: { label: "보관", color: "text-slate-400", bgColor: "bg-slate-50" },
};

type Tab = "info" | "files" | "history";

interface StoredFile {
  name: string;
  size: number;
  createdAt: string;
  url: string | null;
}

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [contract, setContract] = useState<Contract | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("info");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<ContractUpdate>({});
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [daysUntil, setDaysUntil] = useState<number | null>(null);
  const [showClausePicker, setShowClausePicker] = useState(false);

  const loadContract = useCallback(async () => {
    try {
      const res = await fetch(`/api/contracts/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setContract(data);
      setProperty(data.property ?? null);
      setEditForm({
        tenantName: data.tenantName,
        tenantPhone: data.tenantPhone,
        deposit: data.deposit,
        monthlyRent: data.monthlyRent,
        startDate: data.startDate?.split("T")[0],
        endDate: data.endDate?.split("T")[0],
        notes: data.notes,
      });
      const diff = new Date(data.endDate).getTime() - Date.now();
      setDaysUntil(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadFiles = useCallback(async () => {
    try {
      const res = await fetch(`/api/contracts/${id}/files`);
      if (res.ok) setFiles(await res.json());
    } catch {
      setFiles([]);
    }
  }, [id]);

  useEffect(() => {
    loadContract();
  }, [loadContract]);

  useEffect(() => {
    if (tab === "files") {
      const controller = new AbortController();
      fetch(`/api/contracts/${id}/files`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => setFiles(data))
        .catch(() => setFiles([]));
      return () => controller.abort();
    }
  }, [tab, id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        await loadContract();
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/contracts/${id}/files`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) await loadFiles();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDeleteFile(path: string) {
    const res = await fetch(`/api/contracts/${id}/files`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    if (res.ok) await loadFiles();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">계약을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const status = STATUS_CONFIG[contract.status] ?? STATUS_CONFIG.draft;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/contracts")}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-800">
              {contract.tenantName}
            </h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}
            >
              {status.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {property?.address ?? "주소 미입력"}
          </p>
        </div>
        {!editing ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditing(true)}
            className="gap-1.5"
          >
            <Pencil size={14} />
            수정
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              <X size={14} />
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-1.5 bg-[#00C896] hover:bg-[#00C896]/90"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              저장
            </Button>
          </div>
        )}
      </div>

      {/* Expiry alert */}
      {(contract.status === "expiring_90" || contract.status === "expiring_30") && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-sm font-medium text-amber-700">
            계약 만료까지 {daysUntil}일 남았습니다
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {([
          { key: "info" as Tab, label: "계약 정보", icon: FileText },
          { key: "files" as Tab, label: "보관함", icon: FileIcon },
          { key: "history" as Tab, label: "알림 이력", icon: Mail },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === "info" && (
        <Card>
          <CardContent className="p-6">
            {editing ? (
              <div className="space-y-4">
                <FieldEdit label="임차인명" value={editForm.tenantName ?? ""} onChange={(v) => setEditForm((p) => ({ ...p, tenantName: v }))} />
                <FieldEdit label="연락처" value={editForm.tenantPhone ?? ""} onChange={(v) => setEditForm((p) => ({ ...p, tenantPhone: v }))} />
                <FieldEdit label="보증금" type="number" value={String(editForm.deposit ?? 0)} onChange={(v) => setEditForm((p) => ({ ...p, deposit: Number(v) }))} />
                <FieldEdit label="월세" type="number" value={String(editForm.monthlyRent ?? 0)} onChange={(v) => setEditForm((p) => ({ ...p, monthlyRent: Number(v) }))} />
                <FieldEdit label="시작일" type="date" value={editForm.startDate ?? ""} onChange={(v) => setEditForm((p) => ({ ...p, startDate: v }))} />
                <FieldEdit label="만기일" type="date" value={editForm.endDate ?? ""} onChange={(v) => setEditForm((p) => ({ ...p, endDate: v }))} />
                <div className="flex items-start gap-3">
                  <span className="text-xs text-slate-400 w-24 shrink-0 pt-2.5">메모</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowClausePicker(true)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#1A3C5E] hover:text-[#1A3C5E]/80 transition-colors"
                      >
                        <BookOpen size={12} />
                        특약 템플릿
                      </button>
                    </div>
                    <textarea
                      value={editForm.notes ?? ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#1A3C5E] resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                {showClausePicker && (
                  <ClauseTemplatePicker
                    onInsert={(text) =>
                      setEditForm((p) => ({
                        ...p,
                        notes: p.notes ? `${p.notes}\n${text}` : text,
                      }))
                    }
                    onClose={() => setShowClausePicker(false)}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <InfoRow label="임차인" value={contract.tenantName} />
                <InfoRow label="연락처" value={contract.tenantPhone || "-"} />
                <InfoRow
                  label="보증금"
                  value={`${contract.deposit.toLocaleString()}원`}
                />
                {contract.contractType === "월세" && (
                  <InfoRow
                    label="월세"
                    value={`${(contract.monthlyRent ?? 0).toLocaleString()}원`}
                  />
                )}
                <InfoRow label="계약 유형" value={contract.contractType} />
                <InfoRow
                  label="계약 기간"
                  value={`${new Date(contract.startDate).toLocaleDateString("ko-KR")} ~ ${new Date(contract.endDate).toLocaleDateString("ko-KR")}`}
                />
                {contract.notes && <InfoRow label="메모" value={contract.notes} />}
                {contract.ocrConfidence !== null && (
                  <InfoRow
                    label="OCR 신뢰도"
                    value={`${Math.round(contract.ocrConfidence)}%`}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Files */}
      {tab === "files" && (
        <div className="space-y-4">
          <label
            className={`flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              uploading
                ? "border-slate-200 bg-slate-50"
                : "border-slate-200 hover:border-[#1A3C5E] hover:bg-slate-50"
            }`}
          >
            <input
              type="file"
              onChange={handleUpload}
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              className="hidden"
            />
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : (
              <Upload size={20} className="text-slate-400" />
            )}
            <span className="text-sm text-slate-500">
              {uploading ? "업로드 중..." : "파일을 드래그하거나 클릭하여 업로드"}
            </span>
          </label>

          {files.length === 0 ? (
            <div className="text-center py-12">
              <FileIcon size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">보관된 파일이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <Card key={file.name}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <FileIcon size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {file.name.split("-").slice(1).join("-") || file.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(file.size / 1024).toFixed(1)}KB
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Download size={14} className="text-slate-400" />
                        </a>
                      )}
                      <button
                        onClick={() =>
                          handleDeleteFile(`${contract.id}/${file.name}`)
                        }
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} className="text-red-300" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: History */}
      {tab === "history" && <CommunicationList contractId={id} />}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 w-24 shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-700 text-right">{value}</span>
    </div>
  );
}

function FieldEdit({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-slate-400 w-24 shrink-0 pt-2.5">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#1A3C5E] resize-none"
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#1A3C5E]"
        />
      )}
    </div>
  );
}
