"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, LogOut, Plus, UserPlus, Filter, ArrowUpDown } from "lucide-react";
import Modal from "@/components/Modal";

type Booking = {
  id: string;
  service: string;
  date: string;
  time: string;
  name: string;
  email: string;
  address: string;
  status: string;
  cleaningCode?: string;
  assignedTo?: string;
  tasks?: string[];
  payment?: {
    method: string;
    amount: number;
    status: string;
  };
  createdAt: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  
  // Filters & Sort
  const [statusFilter, setStatusFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [bookings, statusFilter, staffFilter, sortBy]);

  const fetchData = async () => {
    try {
      const bookingsRes = await fetch("/api/bookings");
      const staffRes = await fetch("/api/staff");
      const data = await bookingsRes.json();
      setBookings(data);
      setStaff(await staffRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Staff filter
    if (staffFilter !== "all") {
      if (staffFilter === "unassigned") {
        filtered = filtered.filter(b => !b.assignedTo);
      } else {
        filtered = filtered.filter(b => b.assignedTo === staffFilter);
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "status":
          return a.status.localeCompare(b.status);
        case "customer":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const assignStaff = async (bookingId: string, staffId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Check availability
    if (staffId) {
      const availRes = await fetch(`/api/availability?staffId=${staffId}&date=${booking.date}&time=${booking.time}`);
      const availData = await availRes.json();
      
      if (!availData.available) {
        alert(`This staff member is already booked at ${booking.time} on ${booking.date}. Please choose a different time or staff member.`);
        return;
      }
    }

    // When staff is assigned, status becomes "Confirmed"
    const newStatus = staffId ? "Confirmed" : "Pending";
    
    await fetch("/api/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, assignedTo: staffId, status: newStatus }),
    });
    fetchData();
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const booking = bookings.find(b => b.id === selectedBooking);
    if (!booking) return;

    const taskRes = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...newTask, 
        bookingId: selectedBooking,
        assignedTo: booking.assignedTo,
        status: "Pending"
      }),
    });

    setTaskModalOpen(false);
    setNewTask({ title: "", description: "" });
    fetchData();
  };

  const getStaffName = (staffId?: string) => {
    if (!staffId) return "Unassigned";
    const member = staff.find(s => s.id === staffId);
    return member ? member.name : "Unknown";
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return { bg: '#fef3c7', color: '#92400e' };
      case 'Confirmed': return { bg: '#dcfce7', color: '#166534' };
      case 'On the Way': return { bg: '#ddd6fe', color: '#5b21b6' };
      case 'Done': return { bg: '#e2e8f0', color: '#475569' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  if (loading) return <div className="container section text-center">Loading...</div>;

  return (
    <div className="section container">
      <h1 className="mb-lg">Booking Management</h1>

      {/* Filters & Sort Bar */}
      <div className="card mb-md" style={{ padding: '1rem' }}>
        <div className="flex gap-md items-center" style={{ flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} />
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Filters:</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem' }}>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="On the Way">On the Way</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem' }}>Staff:</label>
            <select 
              value={staffFilter} 
              onChange={(e) => setStaffFilter(e.target.value)}
              style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
            >
              <option value="all">All</option>
              <option value="unassigned">Unassigned</option>
              {staff.filter(s => s.status === 'Active').map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <ArrowUpDown size={18} />
            <label style={{ fontSize: '0.875rem' }}>Sort:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="status">Status</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Cleaning Code</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Date/Time</th>
              <th style={{ padding: '1rem' }}>Customer</th>
              <th style={{ padding: '1rem' }}>Service</th>
              <th style={{ padding: '1rem' }}>Assigned To</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>No bookings found.</td>
              </tr>
            ) : (
              filteredBookings.map((booking) => {
                const statusStyle = getStatusColor(booking.status);
                return (
                  <tr key={booking.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <code style={{ 
                        background: 'var(--surface-alt)', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {booking.cleaningCode || 'N/A'}
                      </code>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.875rem',
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        fontWeight: 'bold'
                      }}>
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>{booking.date}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{booking.time}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500' }}>{booking.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{booking.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{booking.service}</td>
                    <td style={{ padding: '1rem' }}>
                      {booking.assignedTo ? (
                        <div className="flex items-center gap-sm">
                          <span>{getStaffName(booking.assignedTo)}</span>
                          <button 
                               onClick={() => assignStaff(booking.id, "")}
                               style={{ fontSize: '0.8rem', color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                              (Change)
                          </button>
                        </div>
                      ) : (
                        <select 
                          onChange={(e) => assignStaff(booking.id, e.target.value)}
                          style={{ fontSize: '0.875rem' }}
                          value=""
                        >
                          <option value="" disabled>Assign Staff...</option>
                          {staff.filter(s => s.status === 'Active').map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {/* Confirmed -> On the Way */}
                        {booking.status === 'Confirmed' && (
                           <button 
                             onClick={() => updateStatus(booking.id, 'On the Way')} 
                             className="btn" 
                             style={{ padding: '0.5rem', fontSize: '0.875rem', background: '#3b82f6', color: 'white' }}
                             title="On the Way"
                           >
                             🚗 On Way
                           </button>
                        )}
                        
                        {/* On the Way -> Done */}
                        {booking.status === 'On the Way' && (
                           <button 
                             onClick={() => updateStatus(booking.id, 'Done')} 
                             className="btn btn-primary" 
                             style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                             title="Mark as Done"
                           >
                             <Check size={16} /> Done
                           </button>
                        )}

                        {/* Mark Paid Button */}
                        {booking.payment?.status !== 'Paid' && booking.status !== 'Pending' && (
                           <button 
                             onClick={async () => {
                                 await fetch("/api/bookings", {
                                   method: "PUT",
                                   headers: { "Content-Type": "application/json" },
                                   body: JSON.stringify({ id: booking.id, payment: { status: 'Paid' } }),
                                 });
                                 fetchData();
                             }}
                             className="btn" 
                             style={{ padding: '0.5rem', fontSize: '0.875rem', background: '#10b981', color: 'white' }}
                             title="Mark Paid"
                           >
                             💰 Paid
                           </button>
                        )}

                        {booking.assignedTo && booking.status !== 'Done' && (
                          <button 
                            onClick={() => {
                              setSelectedBooking(booking.id);
                              setTaskModalOpen(true);
                            }} 
                            className="btn btn-secondary" 
                            style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                            title="Add Task"
                          >
                            <Plus size={16} /> Task
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setNewTask({ title: "", description: "" });
        }}
        title="Add Task"
        size="sm"
      >
        <form onSubmit={addTask}>
          <div className="form-group">
            <label>Task Title</label>
            <input 
              required 
              value={newTask.title} 
              onChange={e => setNewTask({...newTask, title: e.target.value})}
              placeholder="e.g., Clean kitchen"
            />
          </div>
          <div className="form-group mb-lg">
            <label>Description</label>
            <textarea 
              required
              value={newTask.description} 
              onChange={e => setNewTask({...newTask, description: e.target.value})}
              placeholder="Task details..."
              rows={3}
            ></textarea>
          </div>
          <div className="flex justify-end gap-sm">
            <button type="button" onClick={() => {
              setTaskModalOpen(false);
              setNewTask({ title: "", description: "" });
            }} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Add Task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
