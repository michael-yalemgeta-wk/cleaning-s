"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, MessageSquare, Calendar } from "lucide-react";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    setNotifications(data);
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmation':
        return <Calendar size={20} />;
      case 'job_assignment':
        return <Bell size={20} />;
      case 'reminder':
        return <MessageSquare size={20} />;
      default:
        return <Mail size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'booking_confirmation':
        return 'Booking Confirmation';
      case 'job_assignment':
        return 'Job Assignment';
      case 'reminder':
        return 'Reminder';
      default:
        return 'Notification';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  if (loading) return <div className="section container">Loading...</div>;

  return (
    <div className="section container">
      <h1 className="mb-lg flex items-center gap-sm">
        <Bell /> Notification Center
      </h1>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)' }}>
        {['all', 'booking_confirmation', 'job_assignment', 'reminder'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: filter === f ? '3px solid var(--primary)' : '3px solid transparent',
              color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: filter === f ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {f === 'all' ? 'All' : getTypeLabel(f)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid-3 mb-lg">
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Sent</p>
          <h2>{notifications.length}</h2>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Booking Confirmations</p>
          <h2>{notifications.filter(n => n.type === 'booking_confirmation').length}</h2>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Job Assignments</p>
          <h2>{notifications.filter(n => n.type === 'job_assignment').length}</h2>
        </div>
      </div>

      {/* Notification List */}
      <div className="card">
        <h2 className="mb-md">Notification Log</h2>
        {filteredNotifications.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No notifications found.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id} 
                style={{ 
                  padding: '1rem', 
                  border: notif.priority === 'critical' ? '1px solid #fca5a5' : '1px solid var(--border)', 
                  background: notif.priority === 'critical' ? '#fef2f2' : notif.priority === 'high' ? '#fff7ed' : 'var(--surface)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'start'
                }}
              >
                <div style={{ 
                  padding: '0.75rem', 
                  background: notif.priority === 'critical' ? '#fee2e2' : 'var(--surface-alt)', 
                  borderRadius: '50%',
                  color: notif.priority === 'critical' ? '#b91c1c' : 'var(--primary)'
                }}>
                  {getIcon(notif.type)}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: notif.priority === 'critical' ? '#b91c1c' : 'inherit' }}>{notif.title}</h4>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap'
                    }}>
                      {notif.id.startsWith('alert') ? 'Now' : new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: 'var(--surface-alt)', 
                      borderRadius: 'var(--radius-sm)' 
                    }}>
                      To: {notif.recipient}
                    </span>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: notif.recipientType === 'system' ? '#f3e8ff' : notif.recipientType === 'customer' ? '#dbeafe' : '#fef3c7',
                      color: notif.recipientType === 'system' ? '#6b21a8' : notif.recipientType === 'customer' ? '#1e40af' : '#92400e',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '500'
                    }}>
                      {notif.recipientType === 'customer' ? '👤 Customer' : notif.recipientType === 'system' ? '🤖 System' : '👨‍💼 Staff'}
                    </span>
                    {notif.recipientType !== 'system' && (
                        <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        background: '#dcfce7',
                        color: '#166534',
                        borderRadius: 'var(--radius-sm)' 
                        }}>
                        ✓ Sent
                        </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
