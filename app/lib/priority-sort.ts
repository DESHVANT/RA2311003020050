import { NotificationRecord } from '@/app/types/notification';

const weightByType: Record<NotificationRecord['type'], number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function sortPriorityNotifications(items: NotificationRecord[]): NotificationRecord[] {
  return [...items].sort((left, right) => {
    const weightDelta = weightByType[right.type] - weightByType[left.type];
    if (weightDelta !== 0) {
      return weightDelta;
    }

    const timeDelta = new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime();
    if (timeDelta !== 0) {
      return timeDelta;
    }

    return left.id.localeCompare(right.id);
  });
}