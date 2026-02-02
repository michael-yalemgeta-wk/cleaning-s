import Link from "next/link";
import fs from 'fs/promises';
import path from 'path';
import { Sparkles } from 'lucide-react';
import { getEmbedLink } from '@/utils/imageUtils';

// Direct data access since we are on the server
async function getServices() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'services.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export default async function ServerServiceList() {
  const services = await getServices();
  const activeServices = services.filter((s: any) => s.active !== false);

  return (
    <div className="container">
      <div className="text-center mb-lg">
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Our Services</h2>
        <p style={{ color: 'var(--text-muted)' }}>Comprehensive cleaning solutions for every space</p>
      </div>
      
      <div className="grid-3">
        {activeServices.map((service: any) => (
          <div key={service.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              height: '200px', 
              background: service.imageUrl ? `url(${getEmbedLink(service.imageUrl)})` : 'var(--surface-alt)', 
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 'var(--radius-sm)', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--text-muted)',
              position: 'relative',
              overflow: 'hidden'
            }}>
               {!service.imageUrl && (
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                   <Sparkles size={48} />
                   <span style={{ fontSize: '0.9rem' }}>{service.title}</span>
                 </div>
               )}
            </div>
            <div style={{ padding: '1rem' }}>
              <div className="flex justify-between items-center mb-sm">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{service.title}</h3>
                <span className="text-primary font-bold">${service.price}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', minHeight: '3em' }}>
                {service.description || "Professional cleaning service tailored to your needs."}
              </p>
              <Link href={`/book?service=${encodeURIComponent(service.title)}`} className="btn btn-primary w-full mt-md">
                Book Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
