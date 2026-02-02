import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Fetch data in parallel
  const [notifications, bookings, tasks] = await Promise.all([
    prisma.notification.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.booking.findMany(),
    prisma.task.findMany()
  ]);

  const systemAlerts = [];
  const today = new Date().toISOString().split('T')[0];
  
  if (bookings) {
      // 1. Today's Tasks
      const todaysBookings = bookings.filter((b: any) => b.date === today && b.status !== 'Done');
      if (todaysBookings.length > 0) {
        systemAlerts.push({
          id: 'alert-today-bookings',
          type: 'reminder',
          title: '📅 Today\'s Agenda',
          message: `You have ${todaysBookings.length} booking(s) scheduled for today.`,
          recipient: 'Admin',
          recipientType: 'system',
          createdAt: new Date().toISOString(), // Use ISO string to match Notification model
          priority: 'high'
        });
      }

      // 2. Unassigned Bookings
      const unassigned = bookings.filter((b: any) => !b.assignedTo && b.status !== 'Done');
      if (unassigned.length > 0) {
        systemAlerts.push({
          id: 'alert-unassigned',
          type: 'job_assignment',
          title: '⚠️ Unassigned Bookings',
          message: `There are ${unassigned.length} booking(s) waiting for staff assignment.`,
          recipient: 'Admin',
          recipientType: 'system',
          createdAt: new Date().toISOString(),
          priority: 'critical'
        });
      }

      // 3. Overdue Items (Past date, not Done)
      const overdue = bookings.filter((b: any) => b.date < today && b.status !== 'Done' && b.status !== 'Completed');
      if (overdue.length > 0) {
        systemAlerts.push({
          id: 'alert-overdue',
          type: 'reminder',
          title: '⏰ Overdue Bookings',
          message: `Action Needed: ${overdue.length} booking(s) from previous days are still pending/active.`,
          recipient: 'Admin',
          recipientType: 'system',
          createdAt: new Date().toISOString(),
          priority: 'critical'
        });
      }
  }

  // Ensure types match - Prisma returns Date objects by default, convert to string for consistent API response if needed, 
  // but frontend usually handles standard JSON serialization.
  // Warning: notifications from Prisma have strictly typed Date objects.
  
  return NextResponse.json([...systemAlerts, ...notifications]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newNotification = await prisma.notification.create({
      data: {
        ...body,
        id: `notif-${Date.now()}`,
        status: 'sent',
      },
    });
    
    return NextResponse.json(newNotification);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
