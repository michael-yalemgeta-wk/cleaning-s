import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'staff.json');

async function getStaff() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveStaff(staff: any[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(staff, null, 2));
}

export async function GET() {
  const staff = await getStaff();
  return NextResponse.json(staff);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const staff = await getStaff();
    const newMember = { ...body, id: `staff-${Date.now()}` };
    staff.push(newMember);
    await saveStaff(staff);
    return NextResponse.json(newMember);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add staff' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        let staff = await getStaff();
        staff = staff.map((s: any) => s.id === body.id ? { ...s, ...body } : s);
        await saveStaff(staff);
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

    let staff = await getStaff();
    staff = staff.filter((s: any) => s.id !== id);
    await saveStaff(staff);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}
