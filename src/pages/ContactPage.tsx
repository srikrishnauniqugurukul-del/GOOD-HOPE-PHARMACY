import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, ExternalLink, MapPin, Phone, Send, User } from 'lucide-react';
import { useSite } from '../hooks/useSiteContext';
import { submitContactEnquiry } from '../lib/api';

export const ContactPage: React.FC = () => {
  const { data, t } = useSite();
  const settings = data?.settings;
  const businessHours = data?.businessHours || [];

  const phone = settings?.phone || '+91 75859 76561';
  const plusCode = settings?.plusCodeAddress || '3FCC+MF, Kalimpong, West Bengal, India';
  const mapSearchHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plusCode)}`;
  const activeMapHref =
    settings?.isMapPinVerified && settings.googleMapsUrl ? settings.googleMapsUrl : mapSearchHref;

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hoursTab, setHoursTab] = useState<'pharmacy' | 'doctor_consultation' | 'appointment_booking'>('pharmacy');

  const filteredHours = businessHours.filter((h) => h.scheduleType === hoursTab);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await submitContactEnquiry({ fullName, mobile, email, subject, message });
      setSent(true);
      setFullName('');
      setMobile('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Unable to send enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 lg:py-16 bg-[#F5F7F8]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold text-[#37A879]">{t.sections.contactKicker}</div>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl text-[#172F43] tracking-tight">
            {t.sections.contactTitle}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Verified Details & Map */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-[#172F43]/10 p-6 space-y-5">
              <div>
                <h2 className="font-display font-bold text-xl text-[#172F43]">
                  {settings?.businessName || 'GOOD HOPE PHARMACY'}
                </h2>
                <p className="text-xs text-[#37A879] font-medium mt-0.5">
                  {t.contact.ownerLabel}: {settings?.ownerName || 'Sudarshan Karkee'}
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#37A879] mt-1 shrink-0" />
                  <div>
                    <div className="text-xs text-[#172F43]/55">{t.contact.phoneLabel}</div>
                    <a
                      href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                      className="font-mono-tabular font-bold text-[#172F43] hover:text-[#37A879]"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#37A879] mt-1 shrink-0" />
                  <div>
                    <div className="text-xs text-[#172F43]/55">{t.contact.addressLabel}</div>
                    <div className="font-semibold text-[#172F43]">{plusCode}</div>
                    <div className="text-xs text-[#172F43]/55 mt-2">
                      {t.contact.additionalAddressLabel}
                    </div>
                    <div className="text-xs text-[#172F43]/80">{settings?.streetAddress}</div>
                  </div>
                </div>

                {settings?.email && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-[#37A879] mt-1 shrink-0" />
                    <div>
                      <div className="text-xs text-[#172F43]/55">Email</div>
                      <div className="font-medium text-[#172F43]">{settings.email}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#37A879] hover:bg-[#28865E] text-white text-sm font-semibold"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t.contact.callNow}</span>
                </a>
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#172F43] hover:bg-[#22435f] text-white text-sm font-semibold"
                >
                  <Calendar className="w-4 h-4 text-[#B9D36A]" />
                  <span>{t.nav.book}</span>
                </Link>
                {settings?.visibility.showFacebookLink && settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#172F43]/15 text-[#172F43] text-xs font-semibold hover:bg-[#F5F7F8]"
                  >
                    <span>Facebook Profile (Owner Approved)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Map Location Card (Never embeds unverified third-party pin) */}
            <div className="bg-white rounded-2xl border border-[#172F43]/10 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-[#172F43]">Location Map</h3>
                <span className="text-xs text-[#172F43]/60">
                  {settings?.isMapPinVerified ? 'Verified Pin' : 'Plus Code Reference'}
                </span>
              </div>
              <p className="text-xs text-[#172F43]/70 leading-relaxed">
                {settings?.isMapPinVerified
                  ? 'Location pin verified by Good Hope Pharmacy administration.'
                  : t.contact.mapUnverifiedNote}
              </p>
              <a
                href={activeMapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F1F8F3] border border-[#37A879]/25 text-xs font-semibold text-[#172F43] hover:bg-[#e1f1e7]"
              >
                <MapPin className="w-4 h-4 text-[#37A879]" />
                <span>
                  {settings?.isMapPinVerified ? t.contact.openVerifiedMap : t.contact.openMapSearch}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right: Contact Enquiry Form & Business Hours */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-[#172F43]/10 p-6 sm:p-8">
              <h2 className="font-display font-bold text-xl text-[#172F43] mb-5">
                {t.contact.enquiryTitle}
              </h2>

              {sent ? (
                <div className="p-5 rounded-xl bg-[#F1F8F3] border border-[#37A879]/30 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#37A879] mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#172F43]">{t.contact.enquirySent}</p>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="text-xs font-semibold text-[#37A879] hover:underline cursor-pointer"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ct-name" className="block text-xs font-semibold text-[#172F43] mb-1">
                        Full Name *
                      </label>
                      <input
                        id="ct-name"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
                      />
                    </div>
                    <div>
                      <label htmlFor="ct-mobile" className="block text-xs font-semibold text-[#172F43] mb-1">
                        Mobile Number *
                      </label>
                      <input
                        id="ct-mobile"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm font-mono-tabular focus:outline-none focus:border-[#37A879]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ct-email" className="block text-xs font-semibold text-[#172F43] mb-1">
                        Email (Optional)
                      </label>
                      <input
                        id="ct-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
                      />
                    </div>
                    <div>
                      <label htmlFor="ct-subject" className="block text-xs font-semibold text-[#172F43] mb-1">
                        Subject
                      </label>
                      <input
                        id="ct-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Consultation enquiry, pharmacy timings..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ct-msg" className="block text-xs font-semibold text-[#172F43] mb-1">
                      Message *
                    </label>
                    <textarea
                      id="ct-msg"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can Good Hope Pharmacy assist you? Please avoid sharing sensitive medical records."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
                    />
                  </div>
                  {err && <p className="text-xs text-[#D83B48] font-medium">{err}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#37A879] hover:bg-[#28865E] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Sending...' : t.contact.sendEnquiry}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Business Hours Card */}
            <div className="bg-white rounded-2xl border border-[#172F43]/10 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#37A879]" />
                  <h3 className="font-display font-bold text-base text-[#172F43]">
                    {t.contact.hoursTitle}
                  </h3>
                </div>
                <div className="flex gap-1 p-1 bg-[#F5F7F8] rounded-lg">
                  {(
                    [
                      ['pharmacy', 'Pharmacy'],
                      ['doctor_consultation', 'Doctors'],
                      ['appointment_booking', 'Booking Desk'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setHoursTab(key)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                        hoursTab === key
                          ? 'bg-white text-[#172F43] shadow-sm'
                          : 'text-[#172F43]/65 hover:text-[#172F43]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-[#172F43]/8 text-sm">
                {filteredHours.map((row) => (
                  <div key={row.id} className="py-2 flex items-center justify-between gap-4">
                    <span className="font-medium text-[#172F43]">{row.dayName}</span>
                    <span className="font-mono-tabular text-xs text-[#172F43]/70">
                      {row.isOpen && row.openTime && row.closeTime
                        ? `${row.openTime} – ${row.closeTime}${
                            row.breakStart && row.breakEnd ? ` (Break ${row.breakStart}–${row.breakEnd})` : ''
                          }`
                        : row.note || 'Closed / Pending Confirmation'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
