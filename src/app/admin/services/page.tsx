"use client";

import { useEffect, useState } from "react";
import { Edit, Save, Image as ImageIcon } from "lucide-react";
import { getEmbedLink } from "@/utils/imageUtils";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const res = await fetch("/api/services");
    const data = await res.json();
    setServices(data);
    setLoading(false);
  };

  const handleSave = async (service: any) => {
    await fetch("/api/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
    });
    setEditingId(null);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
    fetchServices();
  };

  const updateService = (id: string, field: string, value: any) => {
    const newServices = services.map(srv => 
      srv.id === id ? { ...srv, [field]: value } : srv
    );
    setServices(newServices);
  };

  if (loading) return <div className="section container">Loading...</div>;

  return (
    <div className="section container">
      <h1 className="mb-lg">Manage Services</h1>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem' }}>Image</th>
                    <th style={{ padding: '1rem' }}>Service</th>
                    <th style={{ padding: '1rem' }}>Description</th>
                    <th style={{ padding: '1rem' }}>Price ($)</th>
                    <th style={{ padding: '1rem' }}>Active</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {services.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>
                            {editingId === s.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  <input
                                    value={s.imageUrl || ""}
                                    onChange={(e) => updateService(s.id, 'imageUrl', e.target.value)}
                                    placeholder="Image URL"
                                    style={{ fontSize: '0.85rem' }}
                                  />
                                  {s.imageUrl && (
                                    <img
                                      src={getEmbedLink(s.imageUrl)}
                                      alt="Preview"
                                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                  )}
                                </div>
                            ) : (
                                s.imageUrl ? (
                                  <img
                                    src={getEmbedLink(s.imageUrl)}
                                    alt={s.title}
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                  />
                                ) : (
                                  <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'var(--surface-alt)',
                                    borderRadius: 'var(--radius-sm)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <ImageIcon size={24} color="var(--text-muted)" />
                                  </div>
                                )
                            )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                            {editingId === s.id ? (
                                <input
                                    value={s.title}
                                    onChange={(e) => updateService(s.id, 'title', e.target.value)}
                                />
                            ) : (
                                <span style={{ fontWeight: 500 }}>{s.title}</span>
                            )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                            {editingId === s.id ? (
                                <textarea
                                    value={s.description || ""}
                                    onChange={(e) => updateService(s.id, 'description', e.target.value)}
                                    rows={3}
                                    style={{ width: '100%', fontSize: '0.9rem' }}
                                    placeholder="Service description..."
                                />
                            ) : (
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {s.description || "No description"}
                                </span>
                            )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                            {editingId === s.id ? (
                                <input
                                    type="number"
                                    value={s.price || 0}
                                    onChange={(e) => updateService(s.id, 'price', parseFloat(e.target.value))}
                                    style={{ width: '80px' }}
                                />
                            ) : (
                                <span>${s.price}</span>
                            )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                            <div
                                onClick={() => {
                                   if(editingId === s.id) updateService(s.id, 'active', !s.active);
                                }}
                                style={{
                                   cursor: editingId === s.id ? 'pointer' : 'default',
                                   padding: '0.25rem 0.5rem',
                                   background: s.active !== false ? '#dcfce7' : '#fee2e2',
                                   color: s.active !== false ? '#166534' : '#b91c1c',
                                   borderRadius: '4px',
                                   fontSize: '0.8rem',
                                   display: 'inline-block'
                                }}
                            >
                                {s.active !== false ? 'Active' : 'Inactive'}
                            </div>
                        </td>
                         <td style={{ padding: '1rem' }}>
                            {editingId === s.id ? (
                                <button onClick={() => handleSave(s)} className="btn btn-primary" style={{ padding: '0.5rem' }}>
                                    <Save size={16} />
                                </button>
                            ) : (
                                <div className="flex gap-sm">
                                  <button onClick={() => setEditingId(s.id)} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                                      <Edit size={16} />
                                  </button>
                                  <button 
                                      onClick={() => handleDelete(s.id)} 
                                      className="btn" 
                                      style={{ padding: '0.5rem', background: '#fee2e2', color: '#b91c1c' }}
                                      title="Delete Service"
                                  >
                                      &times;
                                  </button>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
