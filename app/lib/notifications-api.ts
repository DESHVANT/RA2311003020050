import { NotificationPage, NotificationQuery, NotificationRecord, NotificationType } from '@/app/types/notification';

const API_BASE_URL = '/api/notifications';

const notificationTypes = new Set<NotificationType>(['Event', 'Result', 'Placement']);

function normalizeType(value: unknown): NotificationType {
  const candidate = String(value ?? '').trim();

  if (notificationTypes.has(candidate as NotificationType)) {
    return candidate as NotificationType;
  }

  const capitalized = candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
  if (notificationTypes.has(capitalized as NotificationType)) {
    return capitalized as NotificationType;
  }

  return 'Event';
}

function normalizeRecord(value: unknown): NotificationRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = String(record.id ?? record.ID ?? record.notification_id ?? '').trim();
  const message = String(record.message ?? record.Message ?? '').trim();
  const timestamp = String(record.timestamp ?? record.Timestamp ?? '').trim();
  const type = normalizeType(record.type ?? record.Type);

  if (!id || !message || !timestamp) {
    return null;
  }

  return { id, message, timestamp, type };
}

export function buildNotificationUrl(query: NotificationQuery = {}): string {
  const origin = typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin;
  const url = new URL(API_BASE_URL, origin);

  if (typeof query.limit === 'number') {
    url.searchParams.set('limit', String(query.limit));
  }

  if (typeof query.page === 'number') {
    url.searchParams.set('page', String(query.page));
  }

  if (query.notificationType && query.notificationType !== 'All') {
    url.searchParams.set('notification_type', query.notificationType);
  }

  return url.toString();
}

export async function fetchNotifications(query: NotificationQuery = {}): Promise<NotificationPage> {
  const response = await fetch(buildNotificationUrl(query), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorMessage = response.status === 401 || response.status === 403
      ? 'The notifications service is not authorized for this session.'
      : `Failed to load notifications (${response.status})`;

    throw new Error(errorMessage);
  }

  const payload = (await response.json()) as Record<string, unknown>;
  const sourceItems = payload.items ?? payload.notifications ?? payload.data ?? payload;
  const items = Array.isArray(sourceItems)
    ? sourceItems.map(normalizeRecord).filter((item): item is NotificationRecord => Boolean(item))
    : [];

  const totalValue = payload.total ?? payload.count ?? items.length;

  return {
    items,
    total: typeof totalValue === 'number' ? totalValue : items.length,
  };
}

export async function fetchAllNotifications(): Promise<NotificationPage> {
  const pageSize = 50;
  const maxPages = 20;
  const collectedItems: NotificationRecord[] = [];
  let total = 0;

  for (let page = 1; page <= maxPages; page += 1) {
    const result = await fetchNotifications({ limit: pageSize, page });

    if (page === 1) {
      total = result.total;
    }

    collectedItems.push(...result.items);

    if (result.items.length < pageSize || collectedItems.length >= result.total) {
      break;
    }
  }

  return {
    items: collectedItems,
    total: total || collectedItems.length,
  };
}