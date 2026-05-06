export type NotificationType = "d90" | "d60" | "d30" | "d7";
export type NotificationChannel = "push" | "email" | "kakao";

export interface Notification {
  id: string;
  contractId: string;
  type: NotificationType;
  sentAt: string;
  channel: NotificationChannel;
}

export interface NotificationInsert {
  contractId: string;
  type: NotificationType;
  channel: NotificationChannel;
}
