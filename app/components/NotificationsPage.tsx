'use client';

import { useMemo, useState } from 'react';
import { Alert, Box, Button, ButtonGroup, Container, MenuItem, Pagination, Paper, Select, Stack, Typography } from '@mui/material';
import { NotificationList } from '@/app/components/NotificationList';
import { useNotifications } from '@/app/providers';
import { NotificationRecord, NotificationType } from '@/app/types/notification';

type NotificationsPageProps = {
  variant: 'dashboard' | 'priority';
};

const filterOptions: Array<NotificationType | 'All'> = ['All', 'Event', 'Result', 'Placement'];
const inboxSizes = [10, 15, 20];

export function NotificationsPage({ variant }: NotificationsPageProps) {
  const isPriority = variant === 'priority';
  const { items, total, loading, error, viewedIds, query, setLimit, setPage, setNotificationType, refresh, markAsViewed, sortedPriorityUnreadItems } = useNotifications();
  const [n, setN] = useState(10);

  const visibleItems = useMemo(() => isPriority ? sortedPriorityUnreadItems.slice(0, n) : items, [isPriority, items, n, sortedPriorityUnreadItems]);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));

  const handleOpen = (notification: NotificationRecord) => markAsViewed(notification.id);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {isPriority ? 'Priority Inbox' : 'Campus Notifications'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isPriority
              ? 'Unread notifications ordered by importance first, then recency.'
              : 'Track events, results, and placements in one responsive dashboard.'}
          </Typography>
        </Box>

        {!isPriority && (
          <ButtonGroup variant="outlined" aria-label="notification type filter" sx={{ flexWrap: 'wrap', gap: 1, '& .MuiButtonGroup-grouped': { borderRadius: 2, borderColor: 'divider' } }}>
            {filterOptions.map((option) => (
              <Button key={option} onClick={() => setNotificationType(option)} variant={query.notificationType === option ? 'contained' : 'outlined'} sx={{ textTransform: 'none', minWidth: 92 }}>
                {option}
              </Button>
            ))}
          </ButtonGroup>
        )}

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {isPriority ? 'Top unread notifications' : 'All notifications'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isPriority ? `Showing ${visibleItems.length} of ${sortedPriorityUnreadItems.length} unread items.` : `${items.length} shown of ${total} total. ${viewedIds.length} already viewed.`}
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {loading ? (
              <Alert severity="info">{isPriority ? 'Loading priority inbox...' : 'Loading notifications...'}</Alert>
            ) : (
              <NotificationList
                notifications={visibleItems}
                viewedIds={viewedIds}
                emptyMessage={isPriority ? 'No unread notifications are available in the current feed.' : 'Try another filter or refresh the feed to load notifications.'}
                onOpen={handleOpen}
              />
            )}

            {isPriority ? (
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                <Typography variant="body2" color="text.secondary">n</Typography>
                <Select size="small" value={n} onChange={(event) => setN(Number(event.target.value))}>
                  {inboxSizes.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </Select>
              </Stack>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">Page size</Typography>
                  <Box component="select" value={query.limit} onChange={(event) => setLimit(Number(event.target.value))} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', px: 2, py: 1, minWidth: 88, bgcolor: 'background.paper' }}>
                    {[5, 10, 15, 20].map((option) => <option key={option} value={option}>{option}</option>)}
                  </Box>
                </Stack>

                <Pagination count={totalPages} page={query.page} onChange={(_, page) => setPage(page)} color="primary" shape="rounded" sx={{ alignSelf: { xs: 'center', sm: 'auto' } }} />

                <Alert severity="success" sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}>Marked items persist locally after refresh.</Alert>
              </Stack>
            )}

            {!isPriority && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography component="button" onClick={() => void refresh()} sx={{ border: 'none', background: 'none', color: 'primary.main', fontWeight: 700, cursor: 'pointer', p: 0 }}>
                  Refresh feed
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}