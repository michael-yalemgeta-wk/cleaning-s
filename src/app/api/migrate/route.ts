import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

async function readJson(filename: string) {
    try {
        const filePath = path.join(process.cwd(), 'data', filename);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

export async function GET() {
    try {
        const results: any = {};

        // 1. Services
        const services = await readJson('services.json');
        if (services.length > 0) {
            // Prisma doesn't support ON CONFLICT in createMany easily across DBs, 
            // but for migration we can use deleteMany + createMany or individual upserts.
            // For simplicity/performance in migration, let's use transaction with individual upserts needed for safety,
            // or just createMany and catch error if exists. 
            // Since this is a one-time thing, let's try clean insert.
            
            // To be safe against duplicates, we'll loop upsert for services
            let count = 0;
            for (const s of services) {
                 await prisma.service.upsert({
                    where: { id: s.id },
                    update: s,
                    create: s
                 });
                 count++;
            }
            results.services = `Migrated ${count} items`;
        }

        // 2. Staff
        const staff = await readJson('staff.json');
        if (staff.length > 0) {
            let count = 0;
            for (const s of staff) {
                await prisma.staff.upsert({
                    where: { id: s.id },
                    update: s,
                    create: s
                });
                count++;
            }
            results.staff = `Migrated ${count} items`;
        }

        // 3. Bookings
        const bookings = await readJson('bookings.json');
        if (bookings.length > 0) {
            let count = 0;
            for (const b of bookings) {
                await prisma.booking.upsert({
                    where: { id: b.id },
                    update: b,
                    create: b
                });
                count++;
            }
            results.bookings = `Migrated ${count} items`;
        }

        // 4. Tasks
        const tasks = await readJson('tasks.json');
        if (tasks.length > 0) {
             let count = 0;
             for (const t of tasks) {
                 await prisma.task.upsert({
                     where: { id: t.id },
                     update: t,
                     create: t
                 });
                 count++;
             }
            results.tasks = `Migrated ${count} items`;
        }
        
        // 5. Notifications
        const notifications = await readJson('notifications.json');
        if(notifications.length > 0) {
             let count = 0;
             for (const n of notifications) {
                 await prisma.notification.upsert({
                     where: { id: n.id },
                     update: n,
                     create: n
                 });
                 count++;
             }
            results.notifications = `Migrated ${count} items`;
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
