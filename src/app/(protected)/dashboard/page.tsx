import { StatsCard } from "@/ui/components/dashboard/stats-card";
import { EmptyState } from "@/ui/components/dashboard/empty-state";
import { getAuthenticatedUser } from "@/service/auth";
import { getOrCreateLandlord } from "@/service/auth";
import { getDashboardStats } from "@/service/dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");
  const stats = await getDashboardStats(landlord.id);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-800">계약 현황</h2>
        <p className="text-sm text-slate-400 mt-1">전체 세대 계약 상태 한눈에 보기</p>
      </div>

      {stats.total === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="전체 계약" value={stats.total} />
          <StatsCard
            label="계약 중"
            value={stats.active}
            color="text-[#00C896]"
          />
          <StatsCard
            label="만기 임박"
            value={stats.expiring}
            color="text-[#FF8C00]"
          />
          <StatsCard
            label="공실"
            value={stats.vacancy}
            color="text-[#FF4D4D]"
          />
        </div>
      )}
    </div>
  );
}
