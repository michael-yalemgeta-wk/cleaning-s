import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'services.json');

async function getServices() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveServices(services: any[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(services, null, 2));
}

export async function GET() {
  const services = await getServices();
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const services = await getServices();
    const newService = { ...body, id: body.id || `service-${Date.now()}` };
    services.push(newService);
    await saveServices(services);
    return NextResponse.json(newService);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add service' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let services = await getServices();
    services = services.map((s: any) => s.id === body.id ? body : s);
    await saveServices(services);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    let services = await getServices();
    services = services.filter((s: any) => s.id !== id);
    await saveServices(services);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
