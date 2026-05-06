"use client";

import { useEffect, useState } from "react";
import { Mail, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/ui/components/ui/card";
import type { Communication } from "@/types/communication";

interface CommunicationHistoryProps {
  contractId: string;
}

const channelIcon: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4 text-slate-400" />,
  kakao: <MessageCircle className="w-4 h-4 text-yellow-500" />,
};

export function CommunicationHistory({ contractId }: CommunicationHistoryProps) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/communications?contractId=${contractId}`);
        if (res.ok) {
          const data = await res.json();
          setCommunications(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [contractId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-slate-400">
          이력을 불러오는 중...
        </CardContent>
      </Card>
    );
  }

  if (communications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-slate-400">
          발송 기록이 없습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-bold text-slate-800">커뮤니케이션 이력</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {communications.map((comm) => (
            <div
              key={comm.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 p-3"
            >
              <div className="mt-0.5">{channelIcon[comm.channel] ?? <Mail className="w-4 h-4 text-slate-400" />}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{comm.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">
                    {new Date(comm.createdAt).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {comm.openedAt && (
                    <span className="flex items-center gap-1 text-xs text-[#00C896]">
                      <CheckCircle2 className="w-3 h-3" />
                      열람
                    </span>
                  )}
                  {comm.respondedAt && (
                    <span className="flex items-center gap-1 text-xs text-[#8B5CF6]">
                      <Clock className="w-3 h-3" />
                      응답완료
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
