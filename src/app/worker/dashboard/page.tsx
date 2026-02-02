"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, CheckCircle, Clock, LogOut } from "lucide-react";

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workerName, setWorkerName] = useState("");
  const [staffId, setStaffId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const isWorker = localStorage.getItem("isWorker");
    if (!isWorker) {
      router.push("/worker/login");
      return;
    }
    
    const name = localStorage.getItem("workerName") || "";
    const sid = localStorage.getItem("workerStaffId") || "";
    setWorkerName(name);
    setStaffId(sid);
    
    fetchData(sid);
  }, [router]);

  const fetchData = async (sid: string) => {
    try {
      // Fetch all tasks
      const tasksRes = await fetch("/api/tasks");
      const allTasks = await tasksRes.json();
      
      // Fetch all bookings
      const bookingsRes = await fetch("/api/bookings");
      const allBookings = await bookingsRes.json();
      
      // Filter bookings assigned to this worker
      const myBookings = allBookings.filter((b: any) => b.assignedTo === sid);
      
      // Filter tasks for this worker's bookings
      const myTasks = allTasks.filter((t: any) => 
        t.assignedTo === sid || myBookings.some((b: any) => b.id === t.bookingId)
      );
      
      setBookings(myBookings);
      setTasks(myTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, status }),
    });
    fetchData(staffId);
  };

  const handleLogout = () => {
    localStorage.removeItem("isWorker");
    localStorage.removeItem("workerId");
    localStorage.removeItem("workerName");
    localStorage.removeItem("workerStaffId");
    router.push("/worker/login");
  };

  if (loading) return <div className="container section">Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
        <div className="container flex justify-between items-center">
          <div>
            <h1 style={{ fontSize: '1.5rem' }}>Welcome, {workerName}</h1>
            <p style={{ color: 'var(--text-muted)' }}>Your assigned tasks and jobs</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="container section">
        <h2 className="mb-lg flex items-center gap-sm">
          <ClipboardList /> My Tasks
        </h2>

        {tasks.length === 0 && bookings.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No tasks assigned yet. Check back later!</p>
          </div>
        ) : (
          <>
            {/* Assigned Jobs & History */}
            {bookings.length > 0 && (
              <div className="mb-lg">
                <h3 className="mb-md">My Jobs</h3>
                
                {/* Active Jobs */}
                <h4 className="mb-sm text-muted uppercase text-sm">Active</h4>
                <div className="grid-3 mb-md">
                  {bookings.filter(b => b.status !== 'Completed').length === 0 && <p className="text-muted italic">No active jobs.</p>}
                  {bookings.filter(b => b.status !== 'Completed').map((booking) => (
                    <div key={booking.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                      <div className="flex justify-between items-center mb-md">
                        <h4>{booking.service}</h4>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.875rem',
                          background: booking.status === 'In Progress' ? '#fef9c3' : '#dcfce7',
                          color: booking.status === 'In Progress' ? '#854d0e' : '#166534'
                        }}>
                          {booking.status}
                        </span>
                      </div>
                      <p style={{ marginBottom: '0.5rem' }}><strong>Customer:</strong> {booking.name}</p>
                      <p style={{ marginBottom: '0.5rem' }}><strong>Date:</strong> {booking.date} at {booking.time}</p>
                      <p style={{ marginBottom: '1rem' }}><strong>Address:</strong> {booking.address}</p>
                      {booking.notes && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Note: {booking.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Completed History */}
                <h4 className="mb-sm text-muted uppercase text-sm">History (Completed)</h4>
                <div className="grid-3">
                  {bookings.filter(b => b.status === 'Completed').length === 0 && <p className="text-muted italic">No completed jobs yet.</p>}
                  {bookings.filter(b => b.status === 'Completed').map((booking) => (
                    <div key={booking.id} className="card" style={{ opacity: 0.8 }}>
                      <div className="flex justify-between items-center mb-md">
                        <h4 style={{ textDecoration: 'line-through' }}>{booking.service}</h4>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.875rem',
                          background: '#e2e8f0',
                          color: '#475569'
                        }}>
                          Completed
                        </span>
                      </div>
                      <p style={{ marginBottom: '0.5rem' }}><strong>Customer:</strong> {booking.name}</p>
                      <p style={{ marginBottom: '0.5rem' }}><strong>Date:</strong> {booking.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Tasks */}
            {tasks.length > 0 && (
              <div>
                <h3 className="mb-md">Task Checklist</h3>
                <div className="card">
                  {tasks.map((task) => (
                    <div key={task.id} style={{ 
                      padding: '1rem', 
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ marginBottom: '0.25rem' }}>{task.title}</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{task.description}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {task.status === 'Pending' && (
                          <button 
                            onClick={() => updateTaskStatus(task.id, 'In Progress')}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          >
                            <Clock size={16} /> Start
                          </button>
                        )}
                        {task.status === 'In Progress' && (
                          <button 
                            onClick={() => updateTaskStatus(task.id, 'Completed')}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          >
                            <CheckCircle size={16} /> Complete
                          </button>
                        )}
                        {task.status === 'Completed' && (
                          <span style={{ 
                            padding: '0.5rem 1rem', 
                            borderRadius: 'var(--radius-sm)',
                            background: '#dcfce7',
                            color: '#166534',
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                          }}>
                            ✓ Done
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
