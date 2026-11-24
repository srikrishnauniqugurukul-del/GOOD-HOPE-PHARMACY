import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search } from 'lucide-react';
import { useSite } from '../hooks/useSiteContext';
import { DoctorAvatar } from '../components/DoctorAvatar';

export const DoctorsPage: React.FC = () => {
  const { data, t } = useSite();
  const doctors = data?.doctors || [];
  const departments = data?.departments || [];

  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const filtered = useMemo(() => {
    return doctors.filter((doc) => {
      if (deptFilter !== 'all' && doc.departmentId !== deptFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.speciality.toLowerCase().includes(q) ||
        doc.qualifications.toLowerCase().includes(q) ||
        doc.boardDescription.toLowerCase().includes(q)
      );
    });
  }, [doctors, deptFilter, query]);

  return (
    <div className="bg-[#F5F7F8]/60 py-12 lg:py-16 min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold text-[#37A879]">{t.sections.doctorsKicker}</div>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl text-[#172F43] tracking-tight">
            {t.sections.doctorsTitle}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#172F43]/72 leading-relaxed">
            {t.sections.doctorsSubtitle}
          </p>
        </div>

        {/* Search & Department Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#172F43]/10 p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#172F43]/40 absolute left-3.5 top-3" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by doctor name, speciality, or qualification..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#172F43]/15 text-sm text-[#172F43] focus:outline-none focus:border-[#37A879]"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setDeptFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                deptFilter === 'all'
                  ? 'bg-[#172F43] text-white'
                  : 'bg-[#F5F7F8] text-[#172F43]/75 hover:text-[#172F43]'
              }`}
            >
              All Departments ({doctors.length})
            </button>
            {departments
              .filter((dept) => doctors.some((d) => d.departmentId === dept.id))
              .map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setDeptFilter(dept.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    deptFilter === dept.id
                      ? 'bg-[#37A879] text-white'
                      : 'bg-[#F5F7F8] text-[#172F43]/75 hover:text-[#172F43]'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#172F43]/10 p-10 text-center text-sm text-[#172F43]/65">
            No matching doctors found for your filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((doc) => (
              <article key={doc.id} className="group gh-animated-border p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4">
                    <DoctorAvatar name={doc.name} photoUrl={doc.photoUrl} size="md" />
                    <div>
                      <div className="text-xs font-semibold text-[#37A879]">{doc.speciality}</div>
                      <h2 className="font-display font-bold text-lg text-[#172F43] mt-0.5">
                        {doc.name}
                      </h2>
                      <div className="text-xs text-[#172F43]/60 mt-1">
                        {doc.verificationStatus === 'verified' ? (
                          <span className="text-[#28865E] font-medium">{t.doctorCard.verified}</span>
                        ) : (
                          <span>{t.doctorCard.pendingVerification}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs sm:text-sm text-[#172F43]/75">
                    {doc.qualifications && (
                      <p className="font-medium text-[#172F43]">{doc.qualifications}</p>
                    )}
                    {doc.boardDescription && <p className="leading-relaxed">{doc.boardDescription}</p>}
                    <div className="pt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#172F43]/60">
                      {doc.registrationNumber && (
                        <span className="font-mono-tabular">
                          {t.doctorCard.regNo}: {doc.registrationNumber}
                        </span>
                      )}
                      {doc.affiliation && <span>{doc.affiliation}</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#172F43]/8 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#172F43]/65">
                    <Clock className="w-3.5 h-3.5 text-[#37A879]" />
                    <span>
                      {doc.scheduleConfigured
                        ? t.doctorCard.scheduleAvailable
                        : t.doctorCard.schedulePending}
                    </span>
                  </div>
                  <div className="flex gap-2.5">
                    <Link
                      to={`/doctors/${doc.slug}`}
                      className="flex-1 text-center py-2.5 px-3 rounded-xl border border-[#172F43]/15 text-xs font-semibold text-[#172F43] hover:bg-[#F5F7F8]"
                    >
                      {t.doctorCard.viewProfile}
                    </Link>
                    <Link
                      to={`/book?doctorId=${doc.id}`}
                      className="flex-1 text-center py-2.5 px-3 rounded-xl bg-[#37A879] hover:bg-[#28865E] text-white text-xs font-semibold"
                    >
                      {t.doctorCard.bookWithDoctor}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
