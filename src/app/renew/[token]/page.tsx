import { TenantResponsePage } from "@/ui/components/proposals/tenant-response-page";

export default async function RenewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <TenantResponsePage token={token} />;
}
