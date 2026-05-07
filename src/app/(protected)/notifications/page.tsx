import { NotificationSettingsForm } from "@/ui/components/notifications/notification-settings-form";

export default function NotificationsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-800">알림 설정</h2>
        <p className="text-sm text-slate-500 mt-1">
          만기 알림 채널 및 타이밍 관리
        </p>
      </div>
      <NotificationSettingsForm />
    </div>
  );
}
