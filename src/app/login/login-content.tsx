"use client";

import { createClient } from "@/config/supabase";
import { Button } from "@/ui/components/ui/button";
import { useState } from "react";

export function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleMagicLink() {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <div className="w-full max-w-sm text-center p-8">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">이메일을 확인해주세요</h2>
          <p className="text-sm text-slate-500">
            {email}로 로그인 링크를 보냈습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-2xl font-black text-[#1A3C5E] tracking-tight">
            RentKeeper
          </span>
          <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-[#00C896] text-white font-bold">
            렌트키퍼
          </span>
          <p className="text-sm text-slate-400 mt-2">
            계약은 맺고, 만기는 잊고 — 이제 반대로
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E]/20 focus:border-[#1A3C5E] transition-colors"
              />
            </div>

            <Button
              onClick={handleMagicLink}
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? "전송 중..." : "로그인 링크 받기"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400">또는</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full"
            >
              Google로 계속하기
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
