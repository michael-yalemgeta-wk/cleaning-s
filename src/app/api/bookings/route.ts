import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Helper to get path
const DATA_FILE = path.join(process.cwd(), 'data', 'bookings.json');

async function getBookings() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveBookings(bookings: any[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(bookings, null, 2));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simple validation
    if (!body.service || !body.date || !body.name || !body.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const bookings = await getBookings();
    
    // Generate unique cleaning code
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const cleaningCode = `CLN-${timestamp}-${randomStr}`;
    
    const newBooking = {
      id: timestamp.toString(),
      ...body,
      cleaningCode,
      status: 'Pending', // Pending, Confirmed, On the Way, Done
      createdAt: new Date().toISOString(),
    };
    
    bookings.push(newBooking);
    await saveBookings(bookings);
    
    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Booking Error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET() {
  const bookings = await getBookings();
  return NextResponse.json(bookings);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, assignedTo, payment } = body;
    
    if (!id) {
       return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const bookings = await getBookings();
    const index = bookings.findIndex((b: any) => b.id === id);
    
    if (index === -1) {
       return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    // Update fields if they exist in the body
    if (status) bookings[index].status = status;
    if (assignedTo !== undefined) bookings[index].assignedTo = assignedTo;
    if (payment) bookings[index].payment = { ...bookings[index].payment, ...payment };

    await saveBookings(bookings);
    
    // Notifications logic (simplified for brevity, ensuring existing logic remains if needed later)
    // In a real scenario, we'd trigger specific notifications here based on status changes like "On Way"

    return NextResponse.json(bookings[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
