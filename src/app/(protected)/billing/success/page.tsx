import { redirect } from "next/navigation";

export default function BillingSuccessPage() {
  redirect("/pricing?success=true");
}
