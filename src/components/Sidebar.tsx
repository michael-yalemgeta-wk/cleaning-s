"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  Settings, 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  Briefcase,
  Clock,
  Calendar
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar({ role }: { role: 'admin' | 'owner' }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { href: "/admin/staff", label: "Staff", icon: Users },
    { href: "/admin/services", label: "Services", icon: Briefcase },
    { href: "/admin/content", label: "Content", icon: Settings },
    { href: "/admin/time-slots", label: "Time Slots", icon: Clock },
    { href: "/admin/calendar", label: "Calendar", icon: Calendar },
    { href: "/admin/notifications", label: "Notifications", icon: Settings },
    { href: "/admin/settings", label: "Configuration", icon: Settings },
  ];

  const ownerLinks = [
    { href: "/owner/dashboard", label: "Overview", icon: TrendingUp },
    { href: "/owner/calendar", label: "Calendar", icon: Calendar },
    { href: "/owner/financials", label: "Financials", icon: DollarSign },
    { href: "/owner/settings", label: "Global Settings", icon: Settings },
  ];

  const links = role === 'owner' ? ownerLinks : adminLinks;

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isOwner");
    router.push("/login");
  };

  return (
    <div style={{ 
      width: '250px', 
      background: 'var(--secondary)', 
      color: 'var(--text-inverted)', 
      minHeight: '100vh',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '3rem', paddingLeft: '1rem' }}>
        {role === 'owner' ? 'Owner Portal' : 'Admin Portal'}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400
              }}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </div>

      <button 
        onClick={handleLogout}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            marginTop: 'auto'
        }}
      >
        <LogOut size={20} />
        Logout
      </button>

      <DbStatus />
    </div>
  );
}

function DbStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    checkDb();
    const interval = setInterval(checkDb, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const checkDb = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (e) {
      setStatus('disconnected');
    }
  };

  const getColor = () => {
    if (status === 'checking') return '#fbbf24'; // yellow
    if (status === 'connected') return '#22c55e'; // green
    return '#ef4444'; // red
  };

  return (
    <div style={{ 
        padding: '0.5rem 1rem', 
        fontSize: '0.75rem', 
        color: 'var(--text-muted)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        marginTop: '0.5rem'
    }}>
      <div style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          opacity: 0.8,
          backgroundColor: getColor(),
          boxShadow: `0 0 5px ${getColor()}`
      }} />
      <span>DB: {status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
}
