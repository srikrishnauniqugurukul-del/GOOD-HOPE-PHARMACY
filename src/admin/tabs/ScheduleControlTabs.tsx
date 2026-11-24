import React, { useEffect, useState } from 'react';
import { CalendarOff, Clock, Plus, Save, Trash2, Wand2 } from 'lucide-react';
import type { BusinessHourRow, BusinessHourType, DayAvailability, DoctorSchedule } from '../../types/domain';
import { adminFetch } from '../../lib/api';
import type { AdminTabProps } from '../types';

// ============================================================================
// 8. BUSINESS HOURS TAB (Separate Pharmacy / Consultation / Booking schedules)
// ============================================================================
export const BusinessHoursTab: React.FC<AdminTabProps> = ({ overview, token, onRefresh, notify }) => {
  const [rows, setRows] = useState<BusinessHourRow[]>(overview.businessHours);
  const [activeType, setActiveType] = useState<BusinessHourType>('pharmacy');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRows(overview.businessHours);
  }, [overview.businessHours]);

  const filtered = rows.filter((r) => r.scheduleType === activeType);

  const updateRow = (id: string, patch: Partial<BusinessHourRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminFetch('/api/admin/business-hours', token, {
        method: 'PUT',
        body: JSON.stringify({ businessHours: rows }),
      });
      notify('Business hours saved (Asia/Kolkata IST).');
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed.', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-[#172F43]/10">
          {(
            [
              ['pharmacy', 'Pharmacy Opening Hours'],
              ['doctor_consultation', 'Doctor Consultation Hours'],
              ['appointment_booking', 'Appointment Booking Hours'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveType(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                activeType === key
                  ? 'bg-[#172F43] text-white'
                  : 'text-[#172F43]/70 hover:text-[#172F43]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#37A879] hover:bg-[#28865E] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Hours'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#172F43]/10 divide-y divide-[#172F43]/8">
        {filtered.map((row) => (
          <div
            key={row.id}
            className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs"
          >
            <div className="md:col-span-2 flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={row.isOpen}
                onChange={(e) => updateRow(row.id, { isOpen: e.target.checked })}
              />
              <span className="font-semibold text-[#172F43]">{row.dayName}</span>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] text-[#172F43]/55 block">Open</label>
              <input
                type="time"
                disabled={!row.isOpen}
                value={row.openTime}
                onChange={(e) => updateRow(row.id, { openTime: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg border border-[#172F43]/15 font-mono-tabular disabled:opacity-40"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] text-[#172F43]/55 block">Close</label>
              <input
                type="time"
                disabled={!row.isOpen}
                value={row.closeTime}
                onChange={(e) => updateRow(row.id, { closeTime: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg border border-[#172F43]/15 font-mono-tabular disabled:opacity-40"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] text-[#172F43]/55 block">Break Start</label>
              <input
                type="time"
                disabled={!row.isOpen}
                value={row.breakStart}
                onChange={(e) => updateRow(row.id, { breakStart: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg border border-[#172F43]/15 font-mono-tabular disabled:opacity-40"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] text-[#172F43]/55 block">Break End</label>
              <input
                type="time"
                disabled={!row.isOpen}
                value={row.breakEnd}
                onChange={(e) => updateRow(row.id, { breakEnd: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg border border-[#172F43]/15 font-mono-tabular disabled:opacity-40"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] text-[#172F43]/55 block">Note</label>
              <input
                value={row.note}
                onChange={(e) => updateRow(row.id, { note: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg border border-[#172F43]/15"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 9. INDIVIDUAL DOCTOR AVAILABILITY SCHEDULE TAB
// ============================================================================
export const DoctorAvailabilityTab: React.FC<AdminTabProps> = ({
  overview,
  token,
  onRefresh,
  notify,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState(overview.doctors[0]?.id || '');
  const [draft, setDraft] = useState<DoctorSchedule | null>(
    overview.doctors[0] ? overview.doctorSchedules[overview.doctors[0].id] || null : null
  );
  const [newHoliday, setNewHoliday] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedDoctorId && overview.doctorSchedules[selectedDoctorId]) {
      setDraft(overview.doctorSchedules[selectedDoctorId]);
    }
  }, [selectedDoctorId, overview.doctorSchedules]);

  const updateDay = (dayOfWeek: number, patch: Partial<DayAvailability>) => {
    if (!draft) return;
    setDraft({
      ...draft,
      weeklyDays: draft.weeklyDays.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)),
    });
  };

  const applyStandardPreset = () => {
    if (!draft) return;
    setDraft({
      ...draft,
      isConfigured: true,
      weeklyDays: draft.weeklyDays.map((d) => ({
        ...d,
        enabled: d.dayOfWeek >= 1 && d.dayOfWeek <= 6, // Mon–Sat
        startTime: '10:00',
        endTime: '13:00',
        slotDurationMinutes: 15,
        maxDailyBookings: 12,
      })),
    });
  };

  const addHoliday = () => {
    if (!draft || !newHoliday) return;
    if (!draft.holidays.includes(newHoliday)) {
      setDraft({ ...draft, holidays: [...draft.holidays, newHoliday].sort() });
    }
    setNewHoliday('');
  };

  const handleSave = async () => {
    if (!draft || !selectedDoctorId) return;
    setSaving(true);
    try {
      await adminFetch(`/api/admin/schedules/${selectedDoctorId}`, token, {
        method: 'PUT',
        body: JSON.stringify(draft),
      });
      notify('Doctor schedule saved and live on booking calendar.');
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed.', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#172F43]/10 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-[#172F43]">Select Doctor:</label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-[#172F43]/15 text-xs font-semibold text-[#172F43]"
          >
            {overview.doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.scheduleConfigured ? 'Configured' : 'Pending'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={applyStandardPreset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F1F8F3] border border-[#37A879]/30 text-xs font-semibold text-[#28865E] cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Quick Fill Mon–Sat (10:00–13:00)</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#37A879] hover:bg-[#28865E] text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Doctor Schedule'}</span>
          </button>
        </div>
      </div>

      {draft && (
        <>
          <div className="bg-white rounded-xl border border-[#172F43]/10 p-4 flex flex-wrap items-center gap-5 text-xs">
            <label className="inline-flex items-center gap-2 font-semibold text-[#172F43] cursor-pointer">
              <input
                type="checkbox"
                checked={draft.temporarilyUnavailable}
                onChange={(e) => setDraft({ ...draft, temporarilyUnavailable: e.target.checked })}
              />
              <span>Mark Doctor Temporarily Unavailable</span>
            </label>
            {draft.temporarilyUnavailable && (
              <input
                value={draft.unavailableReason}
                onChange={(e) => setDraft({ ...draft, unavailableReason: e.target.value })}
                placeholder="Reason (e.g., Out of station until Friday)"
                className="flex-1 min-w-[220px] px-3 py-1.5 rounded-lg border border-red-200"
              />
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#172F43]/10 divide-y divide-[#172F43]/8">
            {draft.weeklyDays.map((day) => (
              <div
                key={day.dayOfWeek}
                className="p-3.5 grid grid-cols-2 sm:grid-cols-12 gap-2.5 items-center text-xs"
              >
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => updateDay(day.dayOfWeek, { enabled: e.target.checked })}
                  />
                  <span className="font-semibold text-[#172F43]">{day.dayName}</span>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-[#172F43]/55 block">Start</label>
                  <input
                    type="time"
                    disabled={!day.enabled}
                    value={day.startTime}
                    onChange={(e) => updateDay(day.dayOfWeek, { startTime: e.target.value })}
                    className="w-full px-2 py-1 rounded-lg border border-[#172F43]/15 font-mono-tabular disabled:opacity-40"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-[#172F43]/55 block">End</label>
                  <input
                    type="time"
                    disabled={!day.enabled}
                    value={day.endTime}
                    onChange={(e) => updateDay(day.dayOfWeek, { endTime: e.target.value })}
                    className="w-full px-2 py-1 rounded-lg border border-[#172F43]/15 font-mono-tabular disabled:opacity-40"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-[#172F43]/55 block">Break Start/End</label>
                  <div className="flex gap-1">
                    <input
                      type="time"
                      disabled={!day.enabled}
                      value={day.breakStart}
                      onChange={(e) => updateDay(day.dayOfWeek, { breakStart: e.target.value })}
                      className="w-1/2 px-1 py-1 rounded-lg border border-[#172F43]/15 font-mono-tabular text-[11px] disabled:opacity-40"
                    />
                    <input
                      type="time"
                      disabled={!day.enabled}
                      value={day.breakEnd}
                      onChange={(e) => updateDay(day.dayOfWeek, { breakEnd: e.target.value })}
                      className="w-1/2 px-1 py-1 rounded-lg border border-[#172F43]/15 font-mono-tabular text-[11px] disabled:opacity-40"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-[#172F43]/55 block">Slot (min)</label>
                  <input
                    type="number"
                    min={5}
                    max={90}
                    disabled={!day.enabled}
                    value={day.slotDurationMinutes}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, { slotDurationMinutes: Number(e.target.value) || 15 })
                    }
                    className="w-full px-2 py-1 rounded-lg border border-[#172F43]/15 font-mono-tabular disabled:opacity-40"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-[#172F43]/55 block">Max/Day</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    disabled={!day.enabled}
                    value={day.maxDailyBookings}
                    onChange={(e) =>
                      updateDay(day.dayOfWeek, { maxDailyBookings: Number(e.target.value) || 10 })
                    }
                    className="w-full px-2 py-1 rounded-lg border border-[#172F43]/15 font-mono-tabular disabled:opacity-40"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Doctor-specific Holidays */}
          <div className="bg-white rounded-xl border border-[#172F43]/10 p-4 space-y-3 text-xs">
            <div className="font-semibold text-[#172F43] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#37A879]" />
              <span>Doctor-Specific Leave / Holiday Dates</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                value={newHoliday}
                onChange={(e) => setNewHoliday(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[#172F43]/15 font-mono-tabular"
              />
              <button
                type="button"
                onClick={addHoliday}
                className="px-3 py-1.5 rounded-lg bg-[#172F43] text-white font-semibold cursor-pointer"
              >
                Add Holiday Date
              </button>
            </div>
            {draft.holidays.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {draft.holidays.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F7F8] border border-[#172F43]/15 font-mono-tabular"
                  >
                    <span>{h}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({ ...draft, holidays: draft.holidays.filter((d) => d !== h) })
                      }
                      className="text-[#D83B48] cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// 10. BLOCKED DATES & HOLIDAYS TAB
// ============================================================================
export const BlockedDatesTab: React.FC<AdminTabProps> = ({
  overview,
  token,
  onRefresh,
  notify,
}) => {
  const [date, setDate] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');

  const bookingOpen = overview.settings.visibility.allowPublicBooking;

  const toggleMasterBooking = async () => {
    await adminFetch('/api/admin/settings', token, {
      method: 'PUT',
      body: JSON.stringify({
        visibility: { allowPublicBooking: !bookingOpen },
      }),
    });
    notify(bookingOpen ? 'Public appointment booking paused.' : 'Public appointment booking restored.');
    await onRefresh();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/api/admin/blocked-dates', token, {
        method: 'POST',
        body: JSON.stringify({
          date,
          doctorId: doctorId || null,
          startTime: startTime || null,
          endTime: endTime || null,
          reason,
          isHoliday: !startTime,
        }),
      });
      setDate('');
      setStartTime('');
      setEndTime('');
      setReason('');
      notify('Blocked date / time slot added.');
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to block date.', true);
    }
  };

  const handleRemove = async (id: string) => {
    await adminFetch(`/api/admin/blocked-dates/${id}`, token, { method: 'DELETE' });
    notify('Date availability restored.');
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Master Booking Switch */}
      <div className="bg-white rounded-xl border border-[#172F43]/10 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-sm text-[#172F43]">
            Public Appointment Booking Master Control
          </h3>
          <p className="text-xs text-[#172F43]/65 mt-0.5">
            Currently:{' '}
            <strong className={bookingOpen ? 'text-[#28865E]' : 'text-[#D83B48]'}>
              {bookingOpen ? 'OPEN for online requests' : 'TEMPORARILY CLOSED'}
            </strong>
          </p>
        </div>
        <button
          type="button"
          onClick={toggleMasterBooking}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
            bookingOpen
              ? 'bg-[#D83B48] text-white hover:bg-red-700'
              : 'bg-[#37A879] text-white hover:bg-[#28865E]'
          }`}
        >
          {bookingOpen ? 'Temporarily Close Appointments' : 'Restore Appointment Booking'}
        </button>
      </div>

      {/* Block Date / Slot Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl border border-[#172F43]/10 p-5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs"
      >
        <div className="sm:col-span-2">
          <label className="block font-semibold text-[#172F43] mb-1">Date *</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-[#172F43]/15 font-mono-tabular"
          />
        </div>
        <div className="sm:col-span-3">
          <label className="block font-semibold text-[#172F43] mb-1">Applies To</label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-[#172F43]/15"
          >
            <option value="">Entire Clinic (All Doctors)</option>
            {overview.doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block font-semibold text-[#172F43] mb-1">Slot Start (opt)</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-2.5 py-2 rounded-lg border border-[#172F43]/15 font-mono-tabular"
          />
        </div>
        <div className="sm:col-span-3">
          <label className="block font-semibold text-[#172F43] mb-1">Holiday / Reason *</label>
          <input
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Public Holiday / Maintenance"
            className="w-full px-2.5 py-2 rounded-lg border border-[#172F43]/15"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full py-2 px-3 rounded-lg bg-[#172F43] text-white font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Block</span>
          </button>
        </div>
      </form>

      {/* Active Blocked List */}
      <div className="bg-white rounded-xl border border-[#172F43]/10 divide-y divide-[#172F43]/8">
        {overview.blockedDates.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#172F43]/60">
            No blocked dates or holidays configured.
          </div>
        ) : (
          overview.blockedDates.map((b) => {
            const doc = b.doctorId ? overview.doctors.find((d) => d.id === b.doctorId) : null;
            return (
              <div key={b.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <CalendarOff className="w-4 h-4 text-[#D83B48] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-mono-tabular font-bold text-[#172F43]">
                      {b.date} {b.startTime ? `(${b.startTime}${b.endTime ? `–${b.endTime}` : ''})` : '(Full Day)'}
                    </div>
                    <div className="text-[#172F43]/75 mt-0.5">
                      {b.reason} · {doc ? doc.name : 'All Doctors'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(b.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#172F43]/15 text-[#172F43] hover:bg-[#F5F7F8] font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#D83B48]" />
                  <span>Restore</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
