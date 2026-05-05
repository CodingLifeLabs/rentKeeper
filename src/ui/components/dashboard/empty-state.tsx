import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/ui/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
        <FileText size={28} className="text-slate-300" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">
        아직 등록된 계약이 없습니다
      </h3>
      <p className="text-sm text-slate-400 mb-6 max-w-sm">
        첫 번째 계약을 등록하고 만기 알림을 받아보세요.
      </p>
      <Link href="/contracts/new">
        <Button variant="secondary">
          <Plus size={16} />
          계약 등록하기
        </Button>
      </Link>
    </div>
  );
}
