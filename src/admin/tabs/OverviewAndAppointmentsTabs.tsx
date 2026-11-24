import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { Appointment, AppointmentStatus } from '../../types/domain';
import { adminFetch } from '../../lib/api';
import type { AdminTabProps } from '../types';

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  confirmed: 'text-[#28865E] bg-[#F1F8F3] border-[#37A879]/30',
  cancelled: 'text-[#D83B48] bg-red-50 border-red-200',
  completed: 'text-[#172F43] bg-slate-100 border-slate-200',
  'no-show': 'text-slate-600 bg-slate-100 border-slate-200',
};

const PIE_COLORS = ['#D97706', '#37A879', '#D83B48', '#172F43', '#64748B'];

// ============================================================================
// 1. DASHBOARD OVERVIEW TAB (100% Real DB Stats & Recharts Analytics)
// ============================================================================
export const OverviewTab: React.FC<AdminTabProps> = ({ overview }) => {
  const { stats, appointments, departments } = overview;

  // Daily bookings over last 7 days (real data)
  const dailyData = useMemo(() => {
    const out: Array<{ label: string; date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() + 5.5 * 60 * 60 * 1000 - i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      out.push({
        label: iso.slice(5),
        date: iso,
        count: appointments.filter((a) => a.appointmentDate === iso).length,
      });
    }
    return out;
  }, [appointments]);

  // Department-wise bookings (real data)
  const departmentData = useMemo(() => {
    return departments.map((dept) => ({
      name: dept.name.split(' ')[0],
      fullName: dept.name,
      bookings: appointments.filter((a) => a.departmentId === dept.id).length,
    }));
  }, [departments, appointments]);

  // Status distribution (real data)
  const statusData = useMemo(() => {
    return [
      { name: 'Pending', value: stats.pendingAppointments },
      { name: 'Confirmed', value: stats.confirmedAppointments },
      { name: 'Cancelled', value: stats.cancelledAppointments },
      { name: 'Completed', value: stats.completedAppointments },
      { name: 'No-show', value: stats.noShowAppointments },
    ].filter((s) => s.value > 0);
  }, [stats]);

  const statCards = [
    { label: 'Total Bookings', value: stats.totalBookings, tone: 'text-[#172F43]' },
    { label: "Today's Bookings", value: stats.todayBookings, tone: 'text-[#37A879]' },
    { label: 'Pending Approval', value: stats.pendingAppointments, tone: 'text-amber-600' },
    { label: 'Confirmed', value: stats.confirmedAppointments, tone: 'text-[#28865E]' },
    { label: 'Completed', value: stats.completedAppointments, tone: 'text-[#172F43]' },
    { label: 'Cancelled', value: stats.cancelledAppointments, tone: 'text-[#D83B48]' },
    { label: 'Total Customers', value: stats.totalCustomers, tone: 'text-[#172F43]' },
    { label: 'Active Doctors', value: `${stats.activeDoctors} / ${overview.doctors.length}`, tone: 'text-[#37A879]' },
    { label: 'Active Services', value: `${stats.activeServices} / ${overview.services.length}`, tone: 'text-[#172F43]' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-[#172F43]/10 p-4 flex flex-col justify-between"
          >
            <div className="text-xs text-[#172F43]/60 font-medium">{card.label}</div>
            <div className={`mt-2 font-mono-tabular text-2xl font-bold ${card.tone}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Real Data Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#172F43]/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm text-[#172F43]">
              Daily Appointments (Last 7 Days · IST)
            </h3>
            <span className="text-xs text-[#172F43]/55">Live database records</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#172F43' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#172F43' }} />
                <Tooltip />
                <Bar dataKey="count" name="Appointments" fill="#37A879" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-[#172F43]/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm text-[#172F43]">
              Booking Status Distribution
            </h3>
            <span className="text-xs text-[#172F43]/55 font-mono-tabular">
              n = {stats.totalBookings}
            </span>
          </div>
          {statusData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-[#172F43]/60 px-4">
              <p>No bookings recorded yet.</p>
              <p className="mt-1">Real status metrics appear automatically once patients book appointments.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={82}
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#172F43]/10 p-5">
        <h3 className="font-display font-bold text-sm text-[#172F43] mb-4">
          Department-Wise Appointments
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#172F43' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#172F43' }} />
              <Tooltip />
              <Bar dataKey="bookings" name="Bookings" fill="#172F43" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. APPOINTMENTS MANAGEMENT TAB
// ============================================================================
export const AppointmentsTab: React.FC<AdminTabProps> = ({ overview, token, onRefresh, notify }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'date_asc'>('newest');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const filtered = useMemo(() => {
    const list = overview.appointments.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (dateFrom && a.appointmentDate < dateFrom) return false;
      if (dateTo && a.appointmentDate > dateTo) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.bookingReference.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q) ||
          a.customerMobile.toLowerCase().includes(q) ||
          a.doctorName.toLowerCase().includes(q) ||
          a.serviceName.toLowerCase().includes(q)
        );
      }
      return true;
    });
    return [...list].sort((a, b) =>
      sortOrder === 'newest'
        ? b.createdAt.localeCompare(a.createdAt)
        : a.appointmentDate.localeCompare(b.appointmentDate)
    );
  }, [overview.appointments, statusFilter, dateFrom, dateTo, search, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const updateStatus = async (appt: Appointment, nextStatus: AppointmentStatus) => {
    try {
      await adminFetch(`/api/admin/appointments/${appt.id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      notify(`Booking ${appt.bookingReference} updated to ${nextStatus}.`);
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Update failed.', true);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    try {
      await adminFetch(`/api/admin/appointments/${selectedAppt.id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({
          status: selectedAppt.status,
          adminNotes,
          appointmentDate: rescheduleDate || selectedAppt.appointmentDate,
          startTime: rescheduleTime || selectedAppt.startTime,
        }),
      });
      notify(`Appointment ${selectedAppt.bookingReference} updated.`);
      setSelectedAppt(null);
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Reschedule failed.', true);
    }
  };

  const handleDelete = async (appt: Appointment) => {
    try {
      await adminFetch(`/api/admin/appointments/${appt.id}`, token, { method: 'DELETE' });
      notify(`Booking ${appt.bookingReference} deleted.`);
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Delete failed.', true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#172F43]/10 p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#172F43]/40 absolute left-3 top-2.5" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search ref, customer, mobile, doctor..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#172F43]/15 text-xs focus:outline-none focus:border-[#37A879]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | AppointmentStatus);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-[#172F43]/15 text-xs text-[#172F43]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No-show</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="From date"
          className="px-2.5 py-2 rounded-lg border border-[#172F43]/15 text-xs font-mono-tabular"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          aria-label="To date"
          className="px-2.5 py-2 rounded-lg border border-[#172F43]/15 text-xs font-mono-tabular"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'newest' | 'date_asc')}
          className="px-3 py-2 rounded-lg border border-[#172F43]/15 text-xs text-[#172F43]"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="date_asc">Sort: Appointment Date</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#172F43]/10 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#172F43]/10 bg-[#F5F7F8] text-[#172F43]/70">
              <th className="py-3 px-4 font-semibold">Booking ID</th>
              <th className="py-3 px-4 font-semibold">Customer</th>
              <th className="py-3 px-4 font-semibold">Doctor & Service</th>
              <th className="py-3 px-4 font-semibold">Date & Time</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#172F43]/8">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#172F43]/55">
                  No appointment records match the current filters.
                </td>
              </tr>
            ) : (
              paginated.map((appt) => (
                <tr key={appt.id} className="hover:bg-[#F5F7F8]/60">
                  <td className="py-3 px-4 font-mono-tabular font-semibold text-[#172F43] whitespace-nowrap">
                    {appt.bookingReference}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#172F43]">{appt.customerName}</div>
                    <div className="font-mono-tabular text-[11px] text-[#172F43]/65">
                      {appt.customerMobile}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#172F43]">{appt.doctorName}</div>
                    <div className="text-[11px] text-[#172F43]/65">{appt.serviceName}</div>
                  </td>
                  <td className="py-3 px-4 font-mono-tabular whitespace-nowrap">
                    <div className="font-semibold text-[#172F43]">{appt.appointmentDate}</div>
                    <div className="text-[11px] text-[#37A879]">{appt.startTime}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase ${
                        STATUS_STYLE[appt.status]
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                    {appt.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(appt, 'confirmed')}
                        title="Confirm Appointment"
                        className="px-2.5 py-1 rounded-md bg-[#37A879] text-white font-semibold hover:bg-[#28865E] cursor-pointer"
                      >
                        Confirm
                      </button>
                    )}
                    {appt.status === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(appt, 'completed')}
                        className="px-2.5 py-1 rounded-md bg-[#172F43] text-white font-semibold cursor-pointer"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAppt(appt);
                        setRescheduleDate(appt.appointmentDate);
                        setRescheduleTime(appt.startTime);
                        setAdminNotes(appt.adminNotes || '');
                      }}
                      title="View / Reschedule"
                      className="p-1.5 rounded-md border border-[#172F43]/15 text-[#172F43] hover:bg-[#F5F7F8] cursor-pointer align-middle"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {appt.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(appt, 'cancelled')}
                        title="Cancel"
                        className="p-1.5 rounded-md border border-red-200 text-[#D83B48] hover:bg-red-50 cursor-pointer align-middle"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(appt)}
                      title="Delete"
                      className="p-1.5 rounded-md border border-[#172F43]/15 text-[#172F43]/60 hover:text-[#D83B48] cursor-pointer align-middle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[#172F43]/70">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of{' '}
            {filtered.length}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-[#172F43]/15 disabled:opacity-40 cursor-pointer"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-[#172F43]/15 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail & Reschedule Modal */}
      {selectedAppt && (
        <div
          className="fixed inset-0 z-50 bg-[#172F43]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedAppt(null)}
        >
          <form
            onSubmit={handleSaveDetails}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#172F43]/10 pb-3">
              <div>
                <h4 className="font-display font-bold text-base text-[#172F43]">
                  Booking {selectedAppt.bookingReference}
                </h4>
                <p className="text-xs text-[#172F43]/60">
                  {selectedAppt.customerName} · {selectedAppt.customerMobile}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppt(null)}
                className="p-1.5 rounded-lg hover:bg-[#F5F7F8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F5F7F8] p-3.5 rounded-xl">
              <div>
                <span className="text-[#172F43]/55">Doctor:</span>
                <div className="font-semibold text-[#172F43]">{selectedAppt.doctorName}</div>
              </div>
              <div>
                <span className="text-[#172F43]/55">Service:</span>
                <div className="font-semibold text-[#172F43]">{selectedAppt.serviceName}</div>
              </div>
              {selectedAppt.customerMessage && (
                <div className="col-span-2 pt-2 border-t border-[#172F43]/10">
                  <span className="text-[#172F43]/55">Customer Note:</span>
                  <p className="text-[#172F43] mt-0.5">{selectedAppt.customerMessage}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#172F43] mb-1">
                  Reschedule Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 text-xs font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#172F43] mb-1">
                  Time / Slot
                </label>
                <input
                  type="text"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  placeholder="10:30"
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 text-xs font-mono-tabular"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172F43] mb-1">Status</label>
              <select
                value={selectedAppt.status}
                onChange={(e) =>
                  setSelectedAppt({ ...selectedAppt, status: e.target.value as AppointmentStatus })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 text-xs"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-show</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172F43] mb-1">
                Internal Admin Notes
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAppt(null)}
                className="px-4 py-2 rounded-lg border border-[#172F43]/15 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#37A879] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. APPOINTMENT CALENDAR TAB
// ============================================================================
export const CalendarTab: React.FC<AdminTabProps> = ({ overview }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(
    new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Date(year, month, 1).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const dayBookings = overview.appointments.filter((a) => a.appointmentDate === selectedDay);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 bg-white rounded-xl border border-[#172F43]/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-base text-[#172F43]">{monthLabel}</h3>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-lg border border-[#172F43]/15 hover:bg-[#F5F7F8] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-lg border border-[#172F43]/15 hover:bg-[#F5F7F8] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-[#172F43]/60 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-16 rounded-lg bg-[#F5F7F8]/40" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const count = overview.appointments.filter((a) => a.appointmentDate === iso).length;
            const isBlocked = overview.blockedDates.some((b) => b.date === iso && !b.doctorId);
            const active = selectedDay === iso;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDay(iso)}
                className={`h-16 p-1.5 rounded-lg border text-left flex flex-col justify-between transition-colors cursor-pointer ${
                  active
                    ? 'border-[#37A879] bg-[#F1F8F3]'
                    : isBlocked
                    ? 'border-red-200 bg-red-50/60'
                    : 'border-[#172F43]/10 hover:bg-[#F5F7F8]'
                }`}
              >
                <span className="font-mono-tabular text-xs font-semibold text-[#172F43]">{dayNum}</span>
                {count > 0 && (
                  <span className="text-[10px] font-mono-tabular font-semibold text-[#37A879]">
                    {count} bk
                  </span>
                )}
                {isBlocked && <span className="text-[9px] text-[#D83B48] font-semibold">Blocked</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-4 bg-white rounded-xl border border-[#172F43]/10 p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#172F43]/10 pb-3">
          <CalendarIcon className="w-4 h-4 text-[#37A879]" />
          <h4 className="font-display font-bold text-sm text-[#172F43] font-mono-tabular">
            {selectedDay}
          </h4>
        </div>
        {dayBookings.length === 0 ? (
          <p className="text-xs text-[#172F43]/60 py-6 text-center">
            No appointments scheduled for {selectedDay}.
          </p>
        ) : (
          <div className="space-y-3">
            {dayBookings.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-[#F5F7F8] border border-[#172F43]/8 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-tabular font-bold text-[#172F43]">{a.bookingReference}</span>
                  <span className="uppercase text-[10px] font-bold text-[#37A879]">{a.status}</span>
                </div>
                <div className="text-xs font-semibold text-[#172F43]">{a.customerName}</div>
                <div className="text-[11px] text-[#172F43]/70">{a.doctorName}</div>
                <div className="flex items-center gap-1 text-[11px] font-mono-tabular text-[#172F43]/65">
                  <Clock className="w-3 h-3 text-[#37A879]" />
                  <span>{a.startTime}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
