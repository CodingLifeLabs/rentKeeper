import { SignOutButton } from "@/ui/components/auth/signout-button";

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-6">
      <h1 className="text-sm font-semibold text-slate-800">계약 대시보드</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">{userName}</span>
        <SignOutButton />
      </div>
    </header>
  );
}
