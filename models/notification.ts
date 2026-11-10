export type Notification = {
  id: string;
  type: "reaction" | "report_update";
  message: string;
  challengeId: string | null;
  read: boolean;
  createdAt: string;
};