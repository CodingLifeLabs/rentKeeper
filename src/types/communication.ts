export type CommunicationType = "renewal" | "notice";
export type CommunicationChannel = "email" | "kakao";

export interface Communication {
  id: string;
  contractId: string;
  type: CommunicationType;
  channel: CommunicationChannel;
  message: string;
  openedAt: string | null;
  respondedAt: string | null;
  createdAt: string;
}

export interface CommunicationInsert {
  contractId: string;
  type: CommunicationType;
  channel: CommunicationChannel;
  message: string;
}
