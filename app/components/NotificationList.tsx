'use client';

import { Badge, Box, Chip, Divider, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import { NotificationRecord } from '@/app/types/notification';

type NotificationListProps = {
  notifications: NotificationRecord[];
  viewedIds: string[];
  emptyMessage: string;
  onOpen: (notification: NotificationRecord) => void;
};

const chipColor: Record<NotificationRecord['type'], 'success' | 'warning' | 'info'> = {
  Placement: 'success',
  Result: 'warning',
  Event: 'info',
};

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function NotificationList({ notifications, viewedIds, emptyMessage, onOpen }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Nothing here yet
        </Typography>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 3 }}>
      <List disablePadding>
        {notifications.map((notification, index) => {
          const isViewed = viewedIds.includes(notification.id);

          return (
            <Box key={notification.id}>
              <ListItem
                alignItems="flex-start"
                onClick={() => onOpen(notification)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: isViewed ? 'background.paper' : 'action.hover',
                  py: 2,
                  px: { xs: 2, sm: 3 },
                  transition: 'background-color 160ms ease',
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              >
                <ListItemText
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {notification.message}
                      </Typography>
                      <Chip label={notification.type} color={chipColor[notification.type]} size="small" />
                      {!isViewed && <Badge color="error" badgeContent="New" sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none', borderRadius: 999, px: 1, fontSize: 11 } }} />}
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary" component="div">
                        {notification.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" component="div">
                        {formatTimestamp(notification.timestamp)}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
              {index < notifications.length - 1 && <Divider component="li" />}
            </Box>
          );
        })}
      </List>
    </Paper>
  );
}