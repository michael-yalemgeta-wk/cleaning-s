import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'notifications.json');

async function getNotifications() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveNotifications(notifications: any[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(notifications, null, 2));
}

// Helper to read other data
async function getBookings() {
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'data', 'bookings.json'), 'utf-8');
    return JSON.parse(data);
  } catch (e) { return []; }
}

async function getTasks() {
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'data', 'tasks.json'), 'utf-8');
    return JSON.parse(data);
  } catch (e) { return []; }
}

export async function GET() {
  const notifications = await getNotifications();
  const bookings = await getBookings();
  const tasks = await getTasks();

  const systemAlerts = [];
  const today = new Date().toISOString().split('T')[0];
  
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
      createdAt: new Date().toISOString(),
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

  return NextResponse.json([...systemAlerts, ...notifications]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const notifications = await getNotifications();
    
    const newNotification = {
      id: `notif-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };
    
    notifications.unshift(newNotification);
    await saveNotifications(notifications);
    
    return NextResponse.json(newNotification);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
