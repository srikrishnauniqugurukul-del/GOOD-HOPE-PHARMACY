import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Clock, AlertCircle, User, Phone, Mail, FileText } from 'lucide-react';
import { useSite } from '../hooks/useSiteContext';
import {
  fetchDoctorSlots,
  submitAppointmentBooking,
  type BookingConfirmation,
  type SlotAvailabilityResponse,
} from '../lib/api';

interface BookingWidgetProps {
  preselectedDoctorId?: string;
  preselectedServiceId?: string;
  preselectedDepartmentId?: string;
}

function getTodayIST(): string {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  preselectedDoctorId,
  preselectedServiceId,
  preselectedDepartmentId,
}) => {
  const { data, t } = useSite();

  const departments = data?.departments || [];
  const services = data?.services || [];
  const doctors = data?.doctors || [];
  const settings = data?.settings;
  const allowBooking = settings?.visibility.allowPublicBooking ?? true;

  const [departmentId, setDepartmentId] = useState(preselectedDepartmentId || '');
  const [serviceId, setServiceId] = useState(preselectedServiceId || '');
  const [doctorId, setDoctorId] = useState(preselectedDoctorId || '');
  const [appointmentDate, setAppointmentDate] = useState(getTodayIST());
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);

  const [slotState, setSlotState] = useState<SlotAvailabilityResponse | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  // Sync preselected doctor or service when passed via route params
  useEffect(() => {
    if (preselectedDoctorId && doctors.length > 0) {
      const doc = doctors.find((d) => d.id === preselectedDoctorId);
      if (doc) {
        setDoctorId(doc.id);
        setDepartmentId(doc.departmentId);
        const matchedService = services.find((s) => s.doctorId === doc.id || s.departmentId === doc.departmentId);
        if (matchedService) setServiceId(matchedService.id);
      }
    }
  }, [preselectedDoctorId, doctors, services]);

  useEffect(() => {
    if (preselectedServiceId && services.length > 0) {
      const srv = services.find((s) => s.id === preselectedServiceId);
      if (srv) {
        setServiceId(srv.id);
        setDepartmentId(srv.departmentId);
        if (srv.doctorId) setDoctorId(srv.doctorId);
      }
    }
  }, [preselectedServiceId, services]);

  const filteredServices = useMemo(() => {
    if (!departmentId) return services;
    const list = services.filter((s) => s.departmentId === departmentId);
    return list.length > 0 ? list : services;
  }, [departmentId, services]);

  const filteredDoctors = useMemo(() => {
    if (!departmentId) return doctors;
    const list = doctors.filter((d) => d.departmentId === departmentId);
    return list.length > 0 ? list : doctors;
  }, [departmentId, doctors]);

  // Fetch live server slots whenever doctorId or appointmentDate changes
  useEffect(() => {
    if (!doctorId || !appointmentDate) {
      setSlotState(null);
      setSelectedSlot(null);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSelectedSlot(null);
    fetchDoctorSlots(doctorId, appointmentDate)
      .then((res) => {
        if (!cancelled) {
          setSlotState(res);
        }
      })
      .catch(() => {
        if (!cancelled) setSlotState(null);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [doctorId, appointmentDate]);

  const selectedDept = departments.find((d) => d.id === departmentId);
  const selectedService = services.find((s) => s.id === serviceId);
  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  const handleDepartmentChange = (nextDeptId: string) => {
    setDepartmentId(nextDeptId);
    const firstSrv = services.find((s) => s.departmentId === nextDeptId);
    setServiceId(firstSrv ? firstSrv.id : '');
    const firstDoc = doctors.find((d) => d.departmentId === nextDeptId);
    setDoctorId(firstDoc ? firstDoc.id : doctors[0]?.id || '');
    setSelectedSlot(null);
    setFormError(null);
  };

  const handleServiceChange = (nextServiceId: string) => {
    setServiceId(nextServiceId);
    const srv = services.find((s) => s.id === nextServiceId);
    if (srv) {
      setDepartmentId(srv.departmentId);
      if (srv.doctorId) setDoctorId(srv.doctorId);
    }
    setSelectedSlot(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!departmentId) return setFormError(t.booking.errors.selectDept);
    if (!serviceId) return setFormError(t.booking.errors.selectService);
    if (!doctorId) return setFormError(t.booking.errors.selectDoctor);
    if (!appointmentDate) return setFormError(t.booking.errors.selectDate);
    if (slotState?.isBlocked) return setFormError(slotState.blockedReason || t.booking.blockedDateNotice);
    if (!selectedSlot) return setFormError(t.booking.errors.selectSlot);
    if (customerName.trim().length < 2) return setFormError(t.booking.errors.enterName);
    if (customerMobile.trim().length < 7) return setFormError(t.booking.errors.enterMobile);

    setSubmitting(true);
    try {
      const receipt = await submitAppointmentBooking({
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        customerEmail: customerEmail.trim() || undefined,
        departmentId,
        serviceId,
        doctorId,
        appointmentDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        customerMessage: customerMessage.trim() || undefined,
      });
      setConfirmation(receipt);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setConfirmation(null);
    setSelectedSlot(null);
    setCustomerName('');
    setCustomerMobile('');
    setCustomerEmail('');
    setCustomerMessage('');
    setFormError(null);
  };

  if (!allowBooking) {
    return (
      <div className="bg-[#F1F8F3] border border-[#37A879]/25 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <AlertCircle className="w-8 h-8 text-[#D83B48] mx-auto mb-3" />
        <h3 className="font-display text-xl font-bold text-[#172F43]">Appointment Booking Temporarily Paused</h3>
        <p className="mt-2 text-sm text-[#172F43]/75">{settings?.bookingPausedMessage}</p>
        <a
          href={`tel:${(settings?.phone || '+91 75859 76561').replace(/[^0-9+]/g, '')}`}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#37A879] text-white text-sm font-semibold"
        >
          <Phone className="w-4 h-4" />
          <span>{settings?.phone || '+91 75859 76561'}</span>
        </a>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="bg-white border border-[#37A879]/35 rounded-2xl p-6 sm:p-8 shadow-sm max-w-2xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F1F8F3] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#37A879]" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-[#172F43]">{t.booking.confirmedTitle}</h3>
            <p className="mt-1.5 text-sm text-[#172F43]/75 leading-relaxed">{t.booking.pendingNote}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5F7F8] rounded-xl p-5 border border-[#172F43]/8">
          <div>
            <div className="text-xs text-[#172F43]/60">{t.booking.bookingRef}</div>
            <div className="font-mono-tabular text-lg font-bold text-[#172F43] mt-0.5">
              {confirmation.bookingReference}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#172F43]/60">{t.booking.statusLabel}</div>
            <div className="text-sm font-bold text-amber-700 mt-1 uppercase tracking-wide">
              {confirmation.status} (Awaiting Admin Approval)
            </div>
          </div>
          <div>
            <div className="text-xs text-[#172F43]/60">Doctor</div>
            <div className="text-sm font-semibold text-[#172F43] mt-0.5">{confirmation.doctorName}</div>
          </div>
          <div>
            <div className="text-xs text-[#172F43]/60">Service</div>
            <div className="text-sm font-semibold text-[#172F43] mt-0.5">{confirmation.serviceName}</div>
          </div>
          <div>
            <div className="text-xs text-[#172F43]/60">Date</div>
            <div className="font-mono-tabular text-sm font-semibold text-[#172F43] mt-0.5">
              {confirmation.appointmentDate}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#172F43]/60">Time</div>
            <div className="font-mono-tabular text-sm font-semibold text-[#172F43] mt-0.5">
              {confirmation.startTime === 'Enquiry' ? 'Desk Timing Confirmation' : `${confirmation.startTime} – ${confirmation.endTime}`}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <a
            href={`tel:${(settings?.phone || '+91 75859 76561').replace(/[^0-9+]/g, '')}`}
            className="text-sm font-semibold text-[#37A879] hover:underline"
          >
            Need urgent desk assistance? Call {settings?.phone || '+91 75859 76561'}
          </a>
          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-2.5 rounded-xl bg-[#172F43] text-white text-sm font-semibold hover:bg-[#23435e] transition-colors cursor-pointer"
          >
            {t.booking.newBooking}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: Structured Booking Steps */}
      <div className="lg:col-span-8 space-y-6 bg-white border border-[#172F43]/10 rounded-2xl p-5 sm:p-8">
        {/* Steps 1-3: Department, Service, Doctor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="bk-dept" className="block text-xs font-semibold text-[#172F43] mb-1.5">
              {t.booking.stepDepartment} *
            </label>
            <select
              id="bk-dept"
              value={departmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 bg-[#F5F7F8]/60 text-sm text-[#172F43] focus:outline-none focus:border-[#37A879] focus:bg-white"
              required
            >
              <option value="">Select department...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bk-service" className="block text-xs font-semibold text-[#172F43] mb-1.5">
              {t.booking.stepService} *
            </label>
            <select
              id="bk-service"
              value={serviceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 bg-[#F5F7F8]/60 text-sm text-[#172F43] focus:outline-none focus:border-[#37A879] focus:bg-white"
              required
            >
              <option value="">Select service...</option>
              {filteredServices.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="bk-doctor" className="block text-xs font-semibold text-[#172F43] mb-1.5">
              {t.booking.stepDoctor} *
            </label>
            <select
              id="bk-doctor"
              value={doctorId}
              onChange={(e) => {
                setDoctorId(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 bg-[#F5F7F8]/60 text-sm text-[#172F43] focus:outline-none focus:border-[#37A879] focus:bg-white"
              required
            >
              <option value="">Select doctor...</option>
              {filteredDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} — {doc.speciality}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bk-date" className="block text-xs font-semibold text-[#172F43] mb-1.5">
              {t.booking.stepDate} (IST) *
            </label>
            <div className="relative">
              <input
                id="bk-date"
                type="date"
                min={getTodayIST()}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 bg-[#F5F7F8]/60 text-sm font-mono-tabular text-[#172F43] focus:outline-none focus:border-[#37A879] focus:bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Step 5: Genuine Available Time Slots */}
        <div className="pt-2 border-t border-[#172F43]/8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#172F43]">{t.booking.stepSlot} *</span>
            <span className="text-xs text-[#172F43]/60">Timezone: Asia/Kolkata (IST)</span>
          </div>

          {!doctorId ? (
            <p className="text-sm text-[#172F43]/60 bg-[#F5F7F8] rounded-xl p-4">
              Select a doctor and preferred date above to check real availability.
            </p>
          ) : slotsLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-10 rounded-lg bg-[#F5F7F8] animate-pulse" />
              ))}
            </div>
          ) : slotState?.isBlocked ? (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-[#D83B48]">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">{t.booking.blockedDateNotice}</div>
                {slotState.blockedReason && <div className="text-xs mt-0.5 text-[#172F43]/75">{slotState.blockedReason}</div>}
              </div>
            </div>
          ) : slotState?.scheduleConfigured ? (
            slotState.slots.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#F5F7F8] text-sm text-[#172F43]/75">
                No consultation sessions scheduled for this doctor on this weekday. Please try another date.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {slotState.slots.map((slot) => {
                  const isPicked = selectedSlot?.startTime === slot.startTime;
                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot({ startTime: slot.startTime, endTime: slot.endTime })}
                      className={`px-3 py-2.5 rounded-xl text-xs font-mono-tabular font-semibold border transition-all cursor-pointer ${
                        !slot.available
                          ? 'bg-[#F5F7F8] text-[#172F43]/35 border-[#172F43]/8 cursor-not-allowed line-through'
                          : isPicked
                          ? 'bg-[#37A879] text-white border-[#37A879] shadow-sm'
                          : 'bg-white text-[#172F43] border-[#172F43]/15 hover:border-[#37A879] hover:bg-[#F1F8F3]'
                      }`}
                    >
                      <div>{slot.startTime}</div>
                      {!slot.available && slot.reason && (
                        <div className="text-[10px] font-sans font-normal no-underline">{slot.reason}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div className="p-4 rounded-xl bg-[#F1F8F3] border border-[#37A879]/25 space-y-3">
              <p className="text-xs sm:text-sm text-[#172F43]/80 leading-relaxed">
                {t.booking.noSlotsConfigured}
              </p>
              <button
                type="button"
                onClick={() =>
                  setSelectedSlot({ startTime: 'Enquiry', endTime: 'Pending desk confirmation' })
                }
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
                  selectedSlot?.startTime === 'Enquiry'
                    ? 'bg-[#37A879] text-white border-[#37A879]'
                    : 'bg-white text-[#172F43] border-[#37A879]/40 hover:bg-[#37A879]/10'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{t.booking.requestEnquirySlot}</span>
              </button>
            </div>
          )}
        </div>

        {/* Step 6: Patient Contact Details */}
        <div className="pt-4 border-t border-[#172F43]/8 space-y-4">
          <div className="text-xs font-semibold text-[#172F43]">{t.booking.stepDetails}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bk-name" className="block text-xs font-medium text-[#172F43]/75 mb-1">
                {t.booking.fullName} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#172F43]/40 absolute left-3 top-3" />
                <input
                  id="bk-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rohan Sharma"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm text-[#172F43] focus:outline-none focus:border-[#37A879]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="bk-mobile" className="block text-xs font-medium text-[#172F43]/75 mb-1">
                {t.booking.mobile} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#172F43]/40 absolute left-3 top-3" />
                <input
                  id="bk-mobile"
                  type="tel"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm font-mono-tabular text-[#172F43] focus:outline-none focus:border-[#37A879]"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="bk-email" className="block text-xs font-medium text-[#172F43]/75 mb-1">
              {t.booking.emailOptional}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#172F43]/40 absolute left-3 top-3" />
              <input
                id="bk-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm text-[#172F43] focus:outline-none focus:border-[#37A879]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bk-msg" className="block text-xs font-medium text-[#172F43]/75 mb-1">
              {t.booking.messageOptional}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-[#172F43]/40 absolute left-3 top-3" />
              <textarea
                id="bk-msg"
                rows={3}
                maxLength={500}
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder="Preferred morning/afternoon window or general enquiry..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm text-[#172F43] focus:outline-none focus:border-[#37A879]"
              />
            </div>
            <p className="mt-1.5 text-xs text-[#172F43]/55">{t.booking.privacyNote}</p>
          </div>
        </div>

        {formError && (
          <div className="flex items-start gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#D83B48]">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}
      </div>

      {/* Right: Live Booking Summary & Submit */}
      <div className="lg:col-span-4 bg-[#172F43] text-white rounded-2xl p-6 space-y-5 lg:sticky lg:top-24">
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <h3 className="font-display text-base font-bold">{t.booking.stepSummary}</h3>
          <Calendar className="w-4 h-4 text-[#B9D36A]" />
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-white/65">Department</dt>
            <dd className="font-medium text-right">{selectedDept?.name || '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/65">Service</dt>
            <dd className="font-medium text-right">{selectedService?.name || '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/65">Doctor</dt>
            <dd className="font-medium text-right">{selectedDoctor?.name || '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/65">Date</dt>
            <dd className="font-mono-tabular font-medium">{appointmentDate || '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/65">Slot</dt>
            <dd className="font-mono-tabular font-medium text-[#B9D36A]">
              {selectedSlot
                ? selectedSlot.startTime === 'Enquiry'
                  ? 'Desk Timing Request'
                  : selectedSlot.startTime
                : '—'}
            </dd>
          </div>
          {selectedService && (
            <div className="flex justify-between gap-3 pt-2 border-t border-white/12">
              <dt className="text-white/65">Consultation Fee</dt>
              <dd className="font-medium text-right">
                {selectedService.consultationFee !== null && selectedService.consultationFee > 0
                  ? `₹${selectedService.consultationFee}`
                  : selectedService.feeLabel}
              </dd>
            </div>
          )}
        </dl>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-5 rounded-xl bg-[#37A879] hover:bg-[#2d9268] disabled:opacity-60 text-white font-semibold text-sm transition-colors cursor-pointer"
        >
          {submitting ? t.booking.submitting : t.booking.submitBooking}
        </button>

        <p className="text-[11px] text-white/65 leading-relaxed">
          All bookings are recorded with status PENDING until verified and confirmed by Good Hope Pharmacy administration.
        </p>
      </div>
    </form>
  );
};
