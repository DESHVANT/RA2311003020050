'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchAllNotifications, fetchNotifications } from '@/app/lib/notifications-api';
import { sortPriorityNotifications } from '@/app/lib/priority-sort';
import { NotificationPage, NotificationQuery, NotificationRecord, NotificationType } from '@/app/types/notification';

type NotificationContextValue = {
  items: NotificationRecord[];
  total: number;
  allItems: NotificationRecord[];
  allTotal: number;
  loading: boolean;
  error: string | null;
  viewedIds: string[];
  query: Required<Pick<NotificationQuery, 'limit' | 'page'>> & { notificationType: NotificationType | 'All' };
  setLimit: (limit: number) => void;
  setPage: (page: number) => void;
  setNotificationType: (notificationType: NotificationType | 'All') => void;
  refresh: () => Promise<void>;
  markAsViewed: (id: string) => void;
  markManyAsViewed: (ids: string[]) => void;
  isViewed: (id: string) => boolean;
  unreadItems: NotificationRecord[];
  allUnreadItems: NotificationRecord[];
  sortedUnreadItems: NotificationRecord[];
  sortedPriorityUnreadItems: NotificationRecord[];
};

const NotificationContext = createContext<NotificationContextValue | null>(null);
const VIEWED_KEY = 'campus-notifications:viewed-ids';

const defaultQuery: NotificationContextValue['query'] = {
  limit: 10,
  page: 1,
  notificationType: 'All',
};

function readViewedIds(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(VIEWED_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function storeViewedIds(ids: string[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(VIEWED_KEY, JSON.stringify(ids));
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [allItems, setAllItems] = useState<NotificationRecord[]>([]);
  const [allTotal, setAllTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [query, setQuery] = useState(defaultQuery);

  useEffect(() => {
    setViewedIds(readViewedIds());
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const [page, allPage] = await Promise.all([fetchNotifications(query), fetchAllNotifications()]);
      setItems(page.items);
      setTotal(page.total);
      setAllItems(allPage.items);
      setAllTotal(allPage.total);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to load notifications.';
      setError(message);
      setItems([]);
      setTotal(0);
      setAllItems([]);
      setAllTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.limit, query.page, query.notificationType]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refresh();
    }, 30000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateViewedIds = (nextIds: string[]) => {
    setViewedIds(nextIds);
    storeViewedIds(nextIds);
  };

  const markAsViewed = (id: string) => {
    if (!id || viewedIds.includes(id)) {
      return;
    }

    updateViewedIds([...viewedIds, id]);
  };

  const markManyAsViewed = (ids: string[]) => {
    const nextIds = new Set(viewedIds);
    ids.forEach((id) => nextIds.add(id));
    updateViewedIds(Array.from(nextIds));
  };

  const unreadItems = useMemo(() => items.filter((item) => !viewedIds.includes(item.id)), [items, viewedIds]);
  const allUnreadItems = useMemo(() => allItems.filter((item) => !viewedIds.includes(item.id)), [allItems, viewedIds]);
  const sortedUnreadItems = useMemo(() => sortPriorityNotifications(unreadItems), [unreadItems]);
  const sortedPriorityUnreadItems = useMemo(() => sortPriorityNotifications(allUnreadItems), [allUnreadItems]);

  const value = useMemo<NotificationContextValue>(() => ({
    items,
    total,
    allItems,
    allTotal,
    loading,
    error,
    viewedIds,
    query,
    setLimit: (limit) => setQuery((current) => ({ ...current, limit, page: 1 })),
    setPage: (page) => setQuery((current) => ({ ...current, page })),
    setNotificationType: (notificationType) => setQuery((current) => ({ ...current, notificationType, page: 1 })),
    refresh,
    markAsViewed,
    markManyAsViewed,
    isViewed: (id) => viewedIds.includes(id),
    unreadItems,
    allUnreadItems,
    sortedUnreadItems,
    sortedPriorityUnreadItems,
  }), [items, total, allItems, allTotal, loading, error, viewedIds, query, unreadItems, allUnreadItems, sortedUnreadItems, sortedPriorityUnreadItems]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
}