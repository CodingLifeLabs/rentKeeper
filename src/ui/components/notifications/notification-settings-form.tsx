"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Mail, MessageCircle, Smartphone } from "lucide-react";
import { cn } from "@/config/utils";
import { Card, CardHeader, CardContent } from "@/ui/components/ui/card";
import { Button } from "@/ui/components/ui/button";
import {
  DEFAULT_PREFERENCES,
} from "@/types/notification-settings";
import type {
  NotificationPreference,
} from "@/types/notification-settings";
import type { NotificationChannel, ExpiryThreshold } from "@/types";

const CHANNEL_META: Record<
  NotificationChannel,
  { label: string; icon: typeof Bell; description: string }
> = {
  push: {
    label: "푸시 알림",
    icon: Smartphone,
    description: "모바일 기기로 즉시 알림",
  },
  email: {
    label: "이메일",
    icon: Mail,
    description: "이메일로 만기 알림 발송",
  },
  kakao: {
    label: "카카오 알림톡",
    icon: MessageCircle,
    description: "카카오톡으로 알림 전송",
  },
};

const THRESHOLD_LABELS: Record<ExpiryThreshold, string> = {
  d90: "D-90",
  d60: "D-60",
  d30: "D-30",
  d7: "D-7",
};

const ALL_THRESHOLDS: ExpiryThreshold[] = ["d90", "d60", "d30", "d7"];

export function NotificationSettingsForm() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(
    DEFAULT_PREFERENCES,
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/settings");
      if (!res.ok) return;
      const data = await res.json();
      if (data.preferences && Array.isArray(data.preferences)) {
        setPreferences(data.preferences);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const toggleChannel = (channel: NotificationChannel) => {
    setPreferences((prev) =>
      prev.map((p) =>
        p.channel === channel ? { ...p, enabled: !p.enabled } : p,
      ),
    );
    setSaved(false);
  };

  const toggleThreshold = (
    channel: NotificationChannel,
    threshold: ExpiryThreshold,
  ) => {
    setPreferences((prev) =>
      prev.map((p) => {
        if (p.channel !== channel) return p;
        const has = p.thresholds.includes(threshold);
        return {
          ...p,
          thresholds: has
            ? p.thresholds.filter((t) => t !== threshold)
            : [...p.thresholds, threshold],
        };
      }),
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/notifications/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A3C5E] flex items-center justify-center">
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                만기 알림 설정
              </h3>
              <p className="text-xs text-slate-500">
                채널별 알림 수신 및 타이밍 설정
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-slate-500">설정을 불러오는 중...</span>
            </div>
          ) : (
          <>
          <div className="space-y-4">
            {preferences.map((pref) => {
              const meta = CHANNEL_META[pref.channel];
              const Icon = meta.icon;
              return (
                <div
                  key={pref.channel}
                  className={cn(
                    "rounded-xl border p-4 transition-colors",
                    pref.enabled
                      ? "border-slate-200 bg-white"
                      : "border-slate-100 bg-slate-50/50 opacity-60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center",
                          pref.enabled ? "bg-[#1A3C5E]/10" : "bg-slate-100",
                        )}
                      >
                        <Icon
                          size={18}
                          className={
                            pref.enabled ? "text-[#1A3C5E]" : "text-slate-400"
                          }
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">
                          {meta.label}
                        </div>
                        <div className="text-xs text-slate-400">
                          {meta.description}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleChannel(pref.channel)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                        pref.enabled ? "bg-[#00C896]" : "bg-slate-200",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                          pref.enabled ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>

                  {pref.enabled && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-sm font-semibold text-slate-700 mb-2">
                        알림 시점
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ALL_THRESHOLDS.map((threshold) => {
                          const active = pref.thresholds.includes(threshold);
                          return (
                            <button
                              key={threshold}
                              type="button"
                              onClick={() =>
                                toggleThreshold(pref.channel, threshold)
                              }
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                                active
                                  ? "bg-[#1A3C5E] text-white"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                              )}
                            >
                              {THRESHOLD_LABELS[threshold]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            {saved && (
              <span className="text-sm font-semibold text-[#00C896]">
                설정이 저장되었습니다
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className={cn(!saved && "ml-auto")}
            >
              {saving ? "저장 중..." : "설정 저장"}
            </Button>
          </div>
          </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
