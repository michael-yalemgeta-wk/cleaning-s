import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const staff = await prisma.staff.findMany();
    return NextResponse.json(staff);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newMember = await prisma.staff.create({
      data: {
        ...body,
        id: `staff-${Date.now()}`,
      },
    });
    return NextResponse.json(newMember);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add staff' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;
        
        await prisma.staff.update({
          where: { id },
          data: updates,
        });

        return NextResponse.json({ success: true });
      } catch (err) {
        return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
      }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await prisma.staff.delete({
          where: { id },
        });
        
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
    }
}
