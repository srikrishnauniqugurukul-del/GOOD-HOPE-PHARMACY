import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building, Calendar, Clock, FileCheck2, ShieldAlert } from 'lucide-react';
import { useSite } from '../hooks/useSiteContext';
import { DoctorAvatar } from '../components/DoctorAvatar';

export const DoctorDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, t } = useSite();

  const doctor = data?.doctors.find((d) => d.slug === slug || d.id === slug);
  const schedule = doctor ? data?.doctorSchedules[doctor.id] : undefined;
  const relatedServices = doctor
    ? (data?.services || []).filter(
        (s) => s.doctorId === doctor.id || s.departmentId === doctor.departmentId
      )
    : [];

  useEffect(() => {
    if (doctor) {
      document.title = `${doctor.name} (${doctor.speciality}) | Good Hope Pharmacy, Kalimpong`;
    }
    return () => {
      document.title = 'Good Hope Pharmacy – Kalimpong | Doctor Consultations & Appointments';
    };
  }, [doctor]);

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#172F43]">Doctor Profile Not Found</h1>
        <p className="text-sm text-[#172F43]/70">
          This profile may be hidden or removed by Good Hope Pharmacy administration.
        </p>
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#37A879] text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Doctors</span>
        </Link>
      </div>
    );
  }

  const enabledDays = schedule?.isConfigured
    ? schedule.weeklyDays.filter((d) => d.enabled)
    : [];

  return (
    <div className="bg-[#F5F7F8]/60 py-10 lg:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          to="/doctors"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#172F43]/70 hover:text-[#37A879]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Our Doctors</span>
        </Link>

        {/* Main Profile Header Card */}
        <div className="bg-white rounded-2xl border border-[#172F43]/10 p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-start justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <DoctorAvatar name={doctor.name} photoUrl={doctor.photoUrl} size="lg" />
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#37A879]">{doctor.departmentName}</div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#172F43] tracking-tight">
                {doctor.name}
              </h1>
              <p className="text-sm font-semibold text-[#172F43]/85">{doctor.speciality}</p>
              {doctor.qualifications && (
                <p className="text-sm text-[#172F43]/75">{doctor.qualifications}</p>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#172F43]/70">
                {doctor.registrationNumber && (
                  <span className="inline-flex items-center gap-1.5 font-mono-tabular">
                    <FileCheck2 className="w-4 h-4 text-[#37A879]" />
                    <span>{t.doctorCard.regNo}: {doctor.registrationNumber}</span>
                  </span>
                )}
                {doctor.affiliation && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#37A879]" />
                    <span>{doctor.affiliation}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0">
            <Link
              to={`/book?doctorId=${doctor.id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#37A879] hover:bg-[#28865E] text-white text-sm font-semibold gh-cta-outline whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.doctorCard.bookWithDoctor}</span>
            </Link>
            <div className="text-xs text-center text-[#172F43]/60">
              {doctor.verificationStatus === 'verified'
                ? t.doctorCard.verified
                : t.doctorCard.pendingVerification}
            </div>
          </div>
        </div>

        {doctor.verificationStatus !== 'verified' && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F1F8F3] border border-[#37A879]/25 text-xs sm:text-sm text-[#172F43]/80">
            <ShieldAlert className="w-4 h-4 text-[#37A879] mt-0.5 shrink-0" />
            <div>
              Details on this profile are transcribed from the Good Hope Pharmacy doctor availability board in Kalimpong and are awaiting final verification of credentials and timings by administration.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Bio & Services */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-[#172F43]/10 p-6 space-y-3">
              <h2 className="font-display font-bold text-lg text-[#172F43]">About Consultation</h2>
              {doctor.boardDescription && (
                <p className="text-sm font-medium text-[#172F43]">{doctor.boardDescription}</p>
              )}
              <p className="text-sm text-[#172F43]/75 leading-relaxed">{doctor.bio}</p>
            </div>

            {relatedServices.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#172F43]/10 p-6 space-y-4">
                <h2 className="font-display font-bold text-lg text-[#172F43]">Associated Services</h2>
                <div className="divide-y divide-[#172F43]/8">
                  {relatedServices.map((srv) => (
                    <div key={srv.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-sm text-[#172F43]">{srv.name}</div>
                        <div className="text-xs text-[#172F43]/65 mt-0.5">{srv.description}</div>
                      </div>
                      <Link
                        to={`/book?doctorId=${doctor.id}&serviceId=${srv.id}`}
                        className="text-xs font-semibold text-[#37A879] hover:underline whitespace-nowrap"
                      >
                        Request →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Schedule Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#172F43]/10 p-6 space-y-4 h-fit">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-[#172F43]">Consultation Schedule</h2>
              <Clock className="w-4 h-4 text-[#37A879]" />
            </div>

            {schedule?.temporarilyUnavailable ? (
              <p className="text-sm text-[#D83B48] bg-red-50 border border-red-200 rounded-xl p-4">
                Temporarily unavailable: {schedule.unavailableReason || 'Please contact pharmacy desk.'}
              </p>
            ) : enabledDays.length > 0 ? (
              <div className="divide-y divide-[#172F43]/8 text-sm">
                {enabledDays.map((day) => (
                  <div key={day.dayOfWeek} className="py-2.5 flex items-center justify-between">
                    <span className="font-medium text-[#172F43]">{day.dayName}</span>
                    <span className="font-mono-tabular text-xs font-semibold text-[#37A879]">
                      {day.startTime} – {day.endTime} IST
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#172F43]/70 bg-[#F5F7F8] rounded-xl p-4 leading-relaxed">
                Individual weekly timings for {doctor.name} have not been published yet. Please submit an appointment request online or call Good Hope Pharmacy at{' '}
                <span className="font-mono-tabular font-semibold text-[#172F43]">
                  {data?.settings.phone || '+91 75859 76561'}
                </span>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
