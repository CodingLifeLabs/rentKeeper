import { Sidebar } from "@/ui/components/layout/sidebar";
import { Header } from "@/ui/components/layout/header";
import { getAuthenticatedUser } from "@/service/auth";
import { getOrCreateLandlord } from "@/service/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const landlord = await getOrCreateLandlord(user.id, user.email ?? "");

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userName={landlord.name} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
