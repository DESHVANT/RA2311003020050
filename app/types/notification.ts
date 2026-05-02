export type NotificationType = 'Event' | 'Result' | 'Placement';

export type NotificationRecord = {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
};

export type NotificationQuery = {
  limit?: number;
  page?: number;
  notificationType?: NotificationType | 'All';
};

export type NotificationPage = {
  items: NotificationRecord[];
  total: number;
};