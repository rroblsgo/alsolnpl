import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/auth-server';
import { notificationService } from '@/src/fetatures/notifications/services/NotificationService';

export async function PATCH(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { session } = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { id } = await props.params;
  await notificationService.markAsRead(id);

  return NextResponse.json({ success: true });
}
