import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, Calendar, Phone, ShieldCheck, Stethoscope } from 'lucide-react';
import { useSite } from '../hooks/useSiteContext';
import { BookingWidget } from '../components/BookingWidget';
import { GalleryGrid } from '../components/GalleryGrid';

export const AboutPage: React.FC = () => {
  const { data, t } = useSite();
  const settings = data?.settings;
  return (
    <div className="py-12 lg:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-semibold text-[#37A879]">{t.sections.aboutKicker}</div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#172F43] tracking-tight">
            {settings?.aboutHeadline || 'About Good Hope Pharmacy, Kalimpong'}
          </h1>
          <p className="text-base text-[#172F43]/75 leading-relaxed">{settings?.aboutDescription}</p>
        </div>

        {(settings?.visibility.showOwnerProfile ?? true) && (
          <div className="bg-[#F1F8F3] border border-[#37A879]/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {settings?.ownerPhotoUrl && (
              <img
                src={settings.ownerPhotoUrl}
                alt={settings.ownerName}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-2xl object-cover border border-[#37A879]/25 shrink-0"
              />
            )}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#37A879]">Business Owner</div>
              <h2 className="font-display font-bold text-2xl text-[#172F43]">
                {settings?.ownerName || 'Sudarshan Karkee'}
              </h2>
              <p className="text-sm text-[#172F43]/75 max-w-2xl leading-relaxed">
                {settings?.ownerBio}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="gh-animated-border overflow-hidden">
            <img
              src="/assets/aistudio/IMG20261121183635_d5c3d937.jpg"
              alt="Good Hope Pharmacy Circular Signboard"
              referrerPolicy="no-referrer"
              className="w-full h-72 object-cover"
            />
            <div className="p-5">
              <h3 className="font-display font-bold text-base text-[#172F43]">
                Central Kalimpong Location
              </h3>
              <p className="text-xs text-[#172F43]/70 mt-1">
                {settings?.plusCodeAddress} · {settings?.streetAddress}
              </p>
            </div>
          </div>
          <div className="gh-animated-border overflow-hidden">
            <img
              src="/assets/aistudio/IMG20261121183620_98b52b2e.jpg"
              alt="Visiting Doctors Board at Good Hope Pharmacy"
              referrerPolicy="no-referrer"
              className="w-full h-72 object-cover"
            />
            <div className="p-5">
              <h3 className="font-display font-bold text-base text-[#172F43]">
                Multi-Speciality Visiting Consultants
              </h3>
              <p className="text-xs text-[#172F43]/70 mt-1">
                Coordinated appointment enquiries across ENT, Gynaecology & Obstetrics, Pediatrics, Internal Medicine, and Surgery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PharmacyPage: React.FC = () => {
  const { data } = useSite();
  const settings = data?.settings;
  const pharmacyHours = (data?.businessHours || []).filter((h) => h.scheduleType === 'pharmacy');
  const phone = settings?.phone || '+91 75859 76561';

  return (
    <div className="py-12 lg:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-semibold text-[#37A879]">In-Store Pharmacy Information</div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#172F43] tracking-tight">
              {settings?.pharmacyHeadline || 'In-Store Pharmacy Care & Guidance'}
            </h1>
            <p className="text-base text-[#172F43]/75 leading-relaxed">
              {settings?.pharmacyDescription}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#37A879] text-white text-sm font-semibold hover:bg-[#28865E]"
              >
                <Phone className="w-4 h-4" />
                <span>Call Counter: {phone}</span>
              </a>
              <Link
                to="/book"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#172F43]/15 text-[#172F43] text-sm font-semibold hover:bg-[#F5F7F8]"
              >
                <Calendar className="w-4 h-4 text-[#37A879]" />
                <span>Book Doctor Consultation</span>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <img
              src="/assets/aistudio/IMG20261121183635_d5c3d937.jpg"
              alt="Good Hope Pharmacy Counter Signboard"
              referrerPolicy="no-referrer"
              className="w-full rounded-2xl border border-[#172F43]/10 object-cover aspect-[4/3]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="gh-animated-border p-6 space-y-2">
            <Building2 className="w-5 h-5 text-[#37A879]" />
            <h2 className="font-display font-bold text-base text-[#172F43]">In-Person Counter Only</h2>
            <p className="text-sm text-[#172F43]/70">
              All pharmacy enquiries and dispensing happen strictly in person at our Kalimpong Bazar store.
            </p>
          </div>
          <div className="gh-animated-border p-6 space-y-2">
            <ShieldCheck className="w-5 h-5 text-[#37A879]" />
            <h2 className="font-display font-bold text-base text-[#172F43]">No Online Drug Ordering</h2>
            <p className="text-sm text-[#172F43]/70">
              This website does not sell prescription medicines online, process digital refills, or offer automated drug recommendations.
            </p>
          </div>
          <div className="gh-animated-border p-6 space-y-2">
            <Stethoscope className="w-5 h-5 text-[#37A879]" />
            <h2 className="font-display font-bold text-base text-[#172F43]">Doctor Desk Assistance</h2>
            <p className="text-sm text-[#172F43]/70">
              Ask at the counter or book online to confirm visiting dates and timings for our eight specialist consultants.
            </p>
          </div>
        </div>

        {/* Pharmacy Opening Hours Table */}
        <div className="bg-[#F5F7F8] rounded-2xl border border-[#172F43]/10 p-6">
          <h2 className="font-display font-bold text-lg text-[#172F43] mb-4">
            Pharmacy Opening Hours (Asia/Kolkata IST)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {pharmacyHours.map((row) => (
              <div key={row.id} className="bg-white rounded-xl p-3.5 border border-[#172F43]/8">
                <div className="font-semibold text-sm text-[#172F43]">{row.dayName}</div>
                <div className="text-xs font-mono-tabular text-[#172F43]/70 mt-1">
                  {row.isOpen && row.openTime && row.closeTime
                    ? `${row.openTime} – ${row.closeTime}`
                    : row.note || 'Hours pending owner confirmation'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SpecialitiesPage: React.FC = () => {
  const { data, t } = useSite();
  const services = data?.services || [];
  const doctors = data?.doctors || [];

  return (
    <div className="py-12 lg:py-16 bg-[#F5F7F8]/60 min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold text-[#37A879]">{t.sections.servicesKicker}</div>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl text-[#172F43] tracking-tight">
            {t.sections.servicesTitle}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#172F43]/72">
            All consultation categories and fees are managed directly by Good Hope Pharmacy administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((srv, idx) => {
            const linkedDoc = srv.doctorId ? doctors.find((d) => d.id === srv.doctorId) : null;
            return (
              <div key={srv.id} className="gh-animated-border p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#37A879]">{srv.category}</span>
                    <span className="font-mono-tabular text-[#172F43]/45">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display font-bold text-lg text-[#172F43]">{srv.name}</h2>
                  <p className="mt-2 text-sm text-[#172F43]/70 leading-relaxed">{srv.description}</p>
                  {linkedDoc && (
                    <p className="mt-3 text-xs text-[#172F43]/70">
                      Associated Consultant:{' '}
                      <Link to={`/doctors/${linkedDoc.slug}`} className="font-semibold text-[#172F43] hover:text-[#37A879]">
                        {linkedDoc.name}
                      </Link>
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-[#172F43]/8 flex items-center justify-between text-xs">
                  <div className="font-mono-tabular text-[#172F43]/65">
                    {srv.durationMinutes} min ·{' '}
                    {srv.consultationFee !== null && srv.consultationFee > 0
                      ? `₹${srv.consultationFee}`
                      : srv.feeLabel}
                  </div>
                  <Link
                    to={`/book?serviceId=${srv.id}`}
                    className="font-semibold text-[#37A879] hover:text-[#28865E]"
                  >
                    Book →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const GalleryPage: React.FC = () => {
  const { data, t } = useSite();
  return (
    <div className="py-12 lg:py-16 bg-white min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="text-xs font-semibold text-[#37A879]">{t.sections.galleryKicker}</div>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl text-[#172F43] tracking-tight">
            {t.sections.galleryTitle}
          </h1>
          <p className="mt-2 text-sm text-[#172F43]/70">
            Photographs published directly by Good Hope Pharmacy administration. Click any photo to view full size.
          </p>
        </div>
        <GalleryGrid items={data?.gallery || []} />
      </div>
    </div>
  );
};

export const BookAppointmentPage: React.FC = () => {
  const [params] = useSearchParams();
  const { t } = useSite();
  return (
    <div className="py-12 lg:py-16 bg-[#F5F7F8]/60 min-h-[75vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold text-[#37A879]">{t.sections.bookingKicker}</div>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl text-[#172F43] tracking-tight">
            {t.sections.bookingTitle}
          </h1>
          <p className="mt-2 text-sm text-[#172F43]/70">
            Choose a department, consultation service, doctor, date, and available time slot. All bookings receive a unique reference number.
          </p>
        </div>
        <BookingWidget
          preselectedDoctorId={params.get('doctorId') || undefined}
          preselectedServiceId={params.get('serviceId') || undefined}
          preselectedDepartmentId={params.get('departmentId') || undefined}
        />
      </div>
    </div>
  );
};
