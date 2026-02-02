import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Default basic timeslots
    const defaultSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

    // Get bookings for this date
    const bookings = await prisma.booking.findMany({
      where: { date },
      select: { time: true },
    });
        
    const bookedTimes = bookings.map((b: { time: string | null }) => b.time);
    
    const availableSlots = defaultSlots.map(time => ({
      time,
      available: !bookedTimes.includes(time)
    }));

    return NextResponse.json(availableSlots);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
  }
}
