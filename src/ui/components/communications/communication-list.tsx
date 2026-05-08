"use client";

import { useEffect, useState } from "react";
import { Mail, MessageSquare, Clock, CheckCircle, ExternalLink } from "lucide-react";
import type { Communication } from "@/types/communication";

interface CommunicationListProps {
  contractId: string;
}

const CHANNEL_ICONS = {
  email: Mail,
  kakao: MessageSquare,
};

const CHANNEL_LABELS = {
  email: "이메일",
  kakao: "알림톡",
};

const TYPE_LABELS = {
  renewal: "갱신 안내",
  notice: "만기 알림",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function CommunicationList({ contractId }: CommunicationListProps) {
  const [logs, setLogs] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/communications?contractId=${contractId}`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [contractId]);

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">이력을 불러오는 중...</div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-8 text-center">
        <Mail size={32} className="mx-auto mb-3 text-slate-200" />
        <p className="text-sm text-slate-400">아직 발송된 알림이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const Icon = CHANNEL_ICONS[log.channel] ?? Mail;
        return (
          <div
            key={log.id}
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
          >
            <div className={`p-2 rounded-lg ${log.channel === "email" ? "bg-blue-50" : "bg-yellow-50"}`}>
              <Icon size={16} className={log.channel === "email" ? "text-blue-500" : "text-yellow-600"} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-slate-600">
                  {TYPE_LABELS[log.type] ?? log.type}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                  {CHANNEL_LABELS[log.channel] ?? log.channel}
                </span>
                {log.openedAt && (
                  <CheckCircle size={12} className="text-emerald-500" />
                )}
              </div>
              <p className="text-sm text-slate-700 truncate">{log.message}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock size={10} className="text-slate-300" />
                <span className="text-[11px] text-slate-400">{formatDate(log.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
