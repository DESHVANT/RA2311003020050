import { NextRequest, NextResponse } from 'next/server';

const REMOTE_API_URL = 'http://20.207.122.201/evaluation-service/notifications';

const fallbackNotifications = [
  { id: 'campus-001', type: 'Placement', message: 'Final shortlist released for the placement drive.', timestamp: '2026-05-02T09:00:00.000Z' },
  { id: 'campus-002', type: 'Result', message: 'Mid-semester results are now available on the portal.', timestamp: '2026-05-02T08:30:00.000Z' },
  { id: 'campus-003', type: 'Event', message: 'Tech talk on AI in education starts at 4 PM.', timestamp: '2026-05-02T08:00:00.000Z' },
  { id: 'campus-004', type: 'Placement', message: 'Company pre-placement talk scheduled for tomorrow.', timestamp: '2026-05-01T18:15:00.000Z' },
  { id: 'campus-005', type: 'Result', message: 'Internal assessment scores for Section B are live.', timestamp: '2026-05-01T14:45:00.000Z' },
  { id: 'campus-006', type: 'Event', message: 'Workshop registration closes tonight at 11:59 PM.', timestamp: '2026-05-01T10:15:00.000Z' },
  { id: 'campus-007', type: 'Placement', message: 'Interview slot allocation has been published.', timestamp: '2026-04-30T17:20:00.000Z' },
  { id: 'campus-008', type: 'Event', message: 'Annual cultural fest rehearsal begins this evening.', timestamp: '2026-04-30T13:10:00.000Z' },
  { id: 'campus-009', type: 'Result', message: 'Library attendance verification results updated.', timestamp: '2026-04-29T09:40:00.000Z' },
  { id: 'campus-010', type: 'Event', message: 'Student council meeting rescheduled to Friday.', timestamp: '2026-04-28T16:05:00.000Z' },
  { id: 'campus-011', type: 'Placement', message: 'Resume review feedback is now visible.', timestamp: '2026-04-28T11:25:00.000Z' },
  { id: 'campus-012', type: 'Result', message: 'Lab practical grades have been posted.', timestamp: '2026-04-27T15:55:00.000Z' },
];

function toPageData(limitValue: string | null, pageValue: string | null, typeValue: string | null) {
  const limit = Math.max(1, Number(limitValue ?? '10') || 10);
  const page = Math.max(1, Number(pageValue ?? '1') || 1);
  const notificationType = typeValue && typeValue !== 'All' ? typeValue : null;

  const filtered = fallbackNotifications.filter((notification) => {
    if (!notificationType) {
      return true;
    }

    return notification.type === notificationType;
  });

  const startIndex = (page - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  return { items, total: filtered.length };
}

export async function GET(request: NextRequest) {
  const remoteUrl = new URL(REMOTE_API_URL);
  const incomingUrl = new URL(request.url);

  ['limit', 'page', 'notification_type'].forEach((key) => {
    const value = incomingUrl.searchParams.get(key);
    if (value) {
      remoteUrl.searchParams.set(key, value);
    }
  });

  try {
    const upstreamResponse = await fetch(remoteUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const responseText = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get('content-type') ?? 'application/json';

    if (!upstreamResponse.ok) {
      const fallback = toPageData(
        incomingUrl.searchParams.get('limit'),
        incomingUrl.searchParams.get('page'),
        incomingUrl.searchParams.get('notification_type')
      );

      return NextResponse.json(fallback, { status: 200 });
    }

    return new NextResponse(responseText, {
      status: upstreamResponse.status,
      headers: {
        'content-type': contentType,
      },
    });
  } catch {
    const fallback = toPageData(
      incomingUrl.searchParams.get('limit'),
      incomingUrl.searchParams.get('page'),
      incomingUrl.searchParams.get('notification_type')
    );

    return NextResponse.json(fallback, { status: 200 });
  }
}