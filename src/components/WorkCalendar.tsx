"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from './Modal';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface WorkCalendarProps {
  role: 'admin' | 'owner' | 'worker' | 'staff';
  staffId?: string;
}

export default function WorkCalendar({ role, staffId }: WorkCalendarProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, staffRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/staff')
      ]);
      
      let allBookings = await bookingsRes.json();
      const allStaff = await staffRes.json();

      // Filter by staff if worker/staff role
      if ((role === 'worker' || role === 'staff') && staffId) {
        allBookings = allBookings.filter((b: any) => b.assignedTo === staffId);
      }

      setBookings(allBookings);
      setStaff(allStaff);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Transform bookings to calendar events
  const events = bookings.map((booking: any) => {
    const [hours, minutes] = booking.time.split(':');
    const startDate = new Date(booking.date);
    startDate.setHours(parseInt(hours), parseInt(minutes));
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2); // Default 2 hour duration

    const staffMember = staff.find(s => s.id === booking.assignedTo);
    
    return {
      id: booking.id,
      title: `${booking.service} - ${booking.name}`,
      start: startDate,
      end: endDate,
      resource: booking,
      staff: staffMember?.name || 'Unassigned',
      status: booking.status
    };
  });


  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#fef3c7';
    // Base darker color for contrast
    let color = '#334155'; // Slate 700 default
    let border = '1px solid #fde68a';
    
    // Status Backgrounds
    switch(event.status) {
      case 'Confirmed':
        backgroundColor = '#dcfce7';
        border = '1px solid #bbf7d0';
        break;
      case 'In Progress':
        backgroundColor = '#fef9c3';
        border = '1px solid #fef08a';
        break;
      case 'On Way':
        backgroundColor = '#ddd6fe';
        border = '1px solid #c7d2fe';
        break;
      case 'Completed':
        backgroundColor = '#e2e8f0';
        border = '1px solid #cbd5e1';
        break;
    }

    // Assignment Text Color Marker
    if (!event.resource.assignedTo) {
      color = '#ef4444'; // Red for Unassigned
      // Optional: clearer visual
      border = '2px dashed #fca5a5';
    } else {
      color = '#0f172a'; // Dark Slate for Assigned
    }

    return {
      style: {
        backgroundColor,
        color,
        border,
        borderRadius: '4px',
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        padding: '2px 4px'
      }
    };
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  if (loading) return <div>Loading calendar...</div>;

  return (
    <>
      <div style={{ height: '600px', background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
          defaultView="month"
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
        />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedEvent(null);
          }}
          title="Booking Details"
          size="md"
        >
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <strong>Service:</strong> {selectedEvent.resource.service}
            </div>
            <div>
              <strong>Customer:</strong> {selectedEvent.resource.name}
            </div>
            <div>
              <strong>Email:</strong> {selectedEvent.resource.email}
            </div>
            <div>
              <strong>Phone:</strong> {selectedEvent.resource.phone || "N/A"}
            </div>
            <div>
              <strong>Address:</strong> {selectedEvent.resource.address}
            </div>
            <div>
              <strong>Date & Time:</strong> {selectedEvent.resource.date} at {selectedEvent.resource.time}
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center gap-sm">
               <strong>Status:</strong>
               <span style={{
                 padding: '0.25rem 0.75rem',
                 borderRadius: '1rem',
                 fontSize: '0.8rem',
                 background: selectedEvent.resource.status === 'Confirmed' ? '#dcfce7' : selectedEvent.resource.status === 'Completed' ? '#e2e8f0' : selectedEvent.resource.status === 'In Progress' ? '#fef9c3' : '#fef3c7',
                 color: selectedEvent.resource.status === 'Confirmed' ? '#166534' : selectedEvent.resource.status === 'Completed' ? '#475569' : selectedEvent.resource.status === 'In Progress' ? '#854d0e' : '#92400e',
                 border: '1px solid var(--border)'
               }}>
                 {selectedEvent.resource.status}
               </span>
            </div>

            <div className="flex items-center gap-sm">
               <strong>Assigned To:</strong>
               <span style={{ 
                 color: selectedEvent.resource.assignedTo ? 'var(--text-main)' : 'var(--danger)', 
                 fontWeight: selectedEvent.resource.assignedTo ? 'normal' : 'bold' 
               }}>
                 {selectedEvent.staff}
               </span>
            </div>

            {selectedEvent.resource.payment && (
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Payment:</strong> <span style={{ color: selectedEvent.resource.payment.status === 'Paid' ? 'var(--primary)' : 'inherit' }}>{selectedEvent.resource.payment.status}</span> (${selectedEvent.resource.payment.amount?.toFixed(2)})
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Calendar Legend */}
      <div className="card mt-md">
        <h3 className="mb-sm">Legend</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Status Colors */}
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Status (Background Color)</span>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', background: '#fef3c7', borderRadius: '4px', border: '1px solid #fde68a' }}></div>
                <span>Pending</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', background: '#dcfce7', borderRadius: '4px', border: '1px solid #bbf7d0' }}></div>
                <span>Confirmed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', background: '#ddd6fe', borderRadius: '4px', border: '1px solid #c7d2fe' }}></div>
                <span>On Way</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', background: '#fef9c3', borderRadius: '4px', border: '1px solid #fef08a' }}></div>
                <span>In Progress</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', background: '#e2e8f0', borderRadius: '4px', border: '1px solid #cbd5e1' }}></div>
                <span>Completed</span>
              </div>
            </div>
          </div>

          {/* Assignment Text Colors */}
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Assignment (Text Color)</span>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <span style={{ fontWeight: 'bold', color: '#0f172a' }}>Abc</span>
                 <span>Assigned</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <span style={{ fontWeight: 'bold', color: '#ef4444' }}>Abc</span>
                 <span>Unassigned</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

