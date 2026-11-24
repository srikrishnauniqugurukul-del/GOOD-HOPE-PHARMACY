import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Stethoscope,
} from 'lucide-react';
import { useSite } from '../hooks/useSiteContext';
import { HeroHealthcareAnimation } from '../components/HeroHealthcareAnimation';
import { DoctorAvatar } from '../components/DoctorAvatar';
import { BookingWidget } from '../components/BookingWidget';
import { GalleryGrid } from '../components/GalleryGrid';

export const HomePage: React.FC = () => {
  const { data, loading, t, language } = useSite();
  const prefersReduced = useReducedMotion();
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  const settings = data?.settings;
  const vis = settings?.visibility;
  const doctors = data?.doctors || [];
  const departments = data?.departments || [];
  const services = data?.services || [];
  const gallery = data?.gallery || [];
  const reviews = data?.reviews || [];

  const filteredDoctors = useMemo(() => {
    if (selectedDeptFilter === 'all') return doctors;
    return doctors.filter((d) => d.departmentId === selectedDeptFilter);
  }, [doctors, selectedDeptFilter]);

  const phone = settings?.phone || '+91 75859 76561';
  const plusCode = settings?.plusCodeAddress || '3FCC+MF, Kalimpong, West Bengal, India';
  const mapHref =
    settings?.isMapPinVerified && settings.googleMapsUrl
      ? settings.googleMapsUrl
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plusCode)}`;

  const heroHeadline = language === 'en' && settings?.heroHeadline ? settings.heroHeadline : t.hero.headline;
  const heroSubheading = language === 'en' && settings?.heroSubheading ? settings.heroSubheading : t.hero.subheading;
  const heroSupporting =
    language === 'en' && settings?.heroSupportingText ? settings.heroSupportingText : t.hero.supporting;

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="h-[420px] rounded-2xl bg-[#F1F8F3] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-[#F5F7F8] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* A. HERO SECTION */}
      {(vis?.showHeroSection ?? true) && (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#F1F8F3]/75 via-white to-white pt-10 pb-14 lg:pt-14 lg:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              {/* Left Copy Column */}
              <motion.div
                initial={prefersReduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 flex flex-col justify-center py-2"
              >
                <div className="text-xs sm:text-sm font-semibold text-[#37A879] tracking-wide">
                  Good Hope Pharmacy · Kalimpong Bazar
                </div>
                <h1 className="mt-3 font-display font-extrabold text-[#172F43] text-[clamp(2.15rem,4vw,3.5rem)] leading-[1.08] tracking-tight text-balance">
                  {heroHeadline}
                </h1>
                <p className="mt-4 font-display text-lg sm:text-xl font-semibold text-[#172F43]/85 text-balance">
                  {heroSubheading}
                </p>
                <p className="mt-3 text-base text-[#172F43]/70 leading-relaxed max-w-xl">
                  {heroSupporting}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3.5">
                  <Link
                    to="/book"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#37A879] hover:bg-[#28865E] text-white font-semibold text-sm gh-cta-outline transition-colors whitespace-nowrap"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{t.hero.ctaPrimary}</span>
                  </Link>
                  <Link
                    to="/doctors"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F1F8F3] text-[#172F43] border border-[#172F43]/15 font-semibold text-sm transition-colors whitespace-nowrap"
                  >
                    <span>{t.hero.ctaSecondary}</span>
                    <ArrowRight className="w-4 h-4 text-[#37A879]" />
                  </Link>
                </div>

                {/* Grounded factual overview row */}
                <div className="mt-8 pt-6 border-t border-[#172F43]/10 grid grid-cols-3 gap-4">
                  <div>
                    <div className="font-mono-tabular font-bold text-2xl text-[#172F43]">
                      {doctors.length}
                    </div>
                    <div className="text-xs text-[#172F43]/65 mt-0.5">Visiting Specialists</div>
                  </div>
                  <div>
                    <div className="font-mono-tabular font-bold text-2xl text-[#172F43]">
                      {services.length}
                    </div>
                    <div className="text-xs text-[#172F43]/65 mt-0.5">Service Categories</div>
                  </div>
                  <div>
                    <div className="font-mono-tabular font-bold text-base sm:text-lg text-[#37A879] leading-7">
                      3FCC+MF
                    </div>
                    <div className="text-xs text-[#172F43]/65 mt-0.5">Kalimpong, WB</div>
                  </div>
                </div>
              </motion.div>

              {/* Right 4-Scene Animated Healthcare Stage */}
              <div className="lg:col-span-6">
                <HeroHealthcareAnimation
                  logoUrl={settings?.logoUrl}
                  sceneLabels={t.hero.sceneLabels}
                  staticToggleOn={t.hero.staticToggleOn}
                  staticToggleOff={t.hero.staticToggleOff}
                  animationEnabled={vis?.showHeroAnimation ?? true}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="gh-section-divider" />

      {/* DOCTORS AVAILABLE AT GOOD HOPE (Primary Homepage Feature) */}
      {(vis?.showDoctorsSection ?? true) && doctors.length > 0 && (
        <section className="py-14 lg:py-18 bg-[#F5F7F8]/65">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <div className="text-xs font-semibold text-[#37A879]">{t.sections.doctorsKicker}</div>
                <h2 className="mt-2 font-display font-extrabold text-2xl sm:text-3xl text-[#172F43] tracking-tight">
                  {t.sections.doctorsTitle}
                </h2>
                <p className="mt-2 text-sm text-[#172F43]/70 leading-relaxed">
                  {t.sections.doctorsSubtitle}
                </p>
              </div>

              {/* Functional Department Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-[#172F43]/10">
                <button
                  type="button"
                  onClick={() => setSelectedDeptFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedDeptFilter === 'all'
                      ? 'bg-[#172F43] text-white'
                      : 'text-[#172F43]/70 hover:text-[#172F43]'
                  }`}
                >
                  All ({doctors.length})
                </button>
                {departments
                  .filter((dept) => doctors.some((d) => d.departmentId === dept.id))
                  .map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => setSelectedDeptFilter(dept.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        selectedDeptFilter === dept.id
                          ? 'bg-[#37A879] text-white'
                          : 'text-[#172F43]/70 hover:text-[#172F43]'
                      }`}
                    >
                      {dept.name.split(' ')[0]}
                    </button>
                  ))}
              </div>
            </div>

            <div className="mt-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredDoctors.map((doc) => (
                <article
                  key={doc.id}
                  className="group gh-animated-border p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3.5">
                      <DoctorAvatar name={doc.name} photoUrl={doc.photoUrl} size="md" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#37A879] truncate">
                          {doc.speciality}
                        </div>
                        <h3 className="font-display font-bold text-base text-[#172F43] mt-0.5 leading-snug">
                          {doc.name}
                        </h3>
                        <div className="mt-1 text-[11px] text-[#172F43]/60">
                          {doc.verificationStatus === 'verified' ? (
                            <span className="text-[#28865E] font-medium">
                              {t.doctorCard.verified}
                            </span>
                          ) : (
                            <span>{t.doctorCard.pendingVerification}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-[#172F43]/75">
                      {doc.qualifications && (
                        <p className="font-medium text-[#172F43] leading-relaxed">
                          {doc.qualifications}
                        </p>
                      )}
                      {doc.boardDescription && (
                        <p className="leading-relaxed line-clamp-2">{doc.boardDescription}</p>
                      )}
                      {doc.registrationNumber && (
                        <p className="font-mono-tabular text-[11px] text-[#172F43]/65">
                          {t.doctorCard.regNo}: {doc.registrationNumber}
                        </p>
                      )}
                      {doc.affiliation && (
                        <p className="text-[11px] text-[#172F43]/65">
                          {doc.affiliation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#172F43]/8 space-y-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#172F43]/65">
                      <Clock className="w-3.5 h-3.5 text-[#37A879] shrink-0" />
                      <span>
                        {doc.scheduleConfigured
                          ? t.doctorCard.scheduleAvailable
                          : t.doctorCard.schedulePending}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/doctors/${doc.slug}`}
                        className="flex-1 text-center py-2 px-3 rounded-lg border border-[#172F43]/15 text-xs font-semibold text-[#172F43] hover:bg-[#F5F7F8] transition-colors whitespace-nowrap"
                      >
                        {t.doctorCard.viewProfile}
                      </Link>
                      <Link
                        to={`/book?doctorId=${doc.id}`}
                        className="flex-1 text-center py-2 px-3 rounded-lg bg-[#37A879] hover:bg-[#28865E] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        {t.doctorCard.bookWithDoctor}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CLEAN SECTION QUICK-NAVIGATOR (Opens each dedicated page on click) */}
      <section className="py-12 lg:py-16 bg-white border-t border-[#172F43]/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">
            <div>
              <div className="text-xs font-semibold text-[#37A879]">Explore Good Hope Pharmacy</div>
              <h2 className="mt-1 font-display font-extrabold text-xl sm:text-2xl text-[#172F43] tracking-tight">
                Select a Section to Open
              </h2>
            </div>
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#172F43] hover:text-[#37A879] whitespace-nowrap"
            >
              <Phone className="w-4 h-4 text-[#37A879]" />
              <span className="font-mono-tabular">{phone}</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                to: '/book',
                title: t.nav.book,
                desc: 'Choose department, doctor, date, and available consultation slot.',
              },
              {
                to: '/specialities',
                title: t.nav.specialities,
                desc: `Browse all ${services.length} medical consultation and pharmacy categories.`,
              },
              {
                to: '/pharmacy',
                title: t.nav.pharmacy,
                desc: 'In-store counter information, timings, and walk-in guidance.',
              },
              {
                to: '/gallery',
                title: t.nav.gallery,
                desc: 'View published pharmacy signboard, doctor board, and clinic photos.',
              },
              {
                to: '/about',
                title: t.nav.about,
                desc: `Learn about Good Hope Pharmacy and owner ${settings?.ownerName || 'Sudarshan Karkee'}.`,
              },
              {
                to: '/contact',
                title: t.nav.contact,
                desc: `${plusCode} · Call, map link, and direct enquiry form.`,
              },
            ].map((card) => (
              <Link
                key={card.to}
                to={card.to}
                className="group gh-animated-border p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-display font-bold text-base text-[#172F43] group-hover:text-[#37A879] transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#172F43]/70 leading-relaxed">{card.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#37A879] shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* OPTIONAL EXTRA HOMEPAGE SECTIONS (Controlled via Admin -> Website Content Show/Hide toggles) */}
      {(vis?.showAboutSection ?? false) && (
        <section className="py-16 lg:py-20 bg-white border-t border-[#172F43]/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="text-xs font-semibold text-[#37A879]">{t.sections.aboutKicker}</div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#172F43] tracking-tight text-balance">
                  {settings?.aboutHeadline || 'Accessible Pharmacy Care & Specialist Consultations in Kalimpong'}
                </h2>
                <p className="text-base text-[#172F43]/75 leading-relaxed">
                  {settings?.aboutDescription}
                </p>

                {(vis?.showOwnerProfile ?? true) && (
                  <div className="pt-4 border-t border-[#172F43]/10 flex items-center gap-4">
                    {settings?.ownerPhotoUrl && (
                      <img
                        src={settings.ownerPhotoUrl}
                        alt={settings.ownerName}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-cover border border-[#37A879]/25 shrink-0"
                      />
                    )}
                    <div>
                      <div className="font-display font-bold text-base text-[#172F43]">
                        {settings?.ownerName || 'Sudarshan Karkee'}
                      </div>
                      <div className="text-xs text-[#37A879] font-medium">
                        Business Owner · Good Hope Pharmacy, Kalimpong
                      </div>
                      <p className="text-xs text-[#172F43]/70 mt-1 leading-relaxed">
                        {settings?.ownerBio}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="gh-animated-border overflow-hidden aspect-[4/5]">
                  <img
                    src="/assets/aistudio/IMG20261121183635_d5c3d937.jpg"
                    alt="Good Hope Pharmacy Circular Signboard in Kalimpong"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="gh-animated-border overflow-hidden aspect-[4/5] mt-6">
                  <img
                    src="/assets/aistudio/IMG20261121183620_98b52b2e.jpg"
                    alt="Good Hope Pharmacy Specialist Doctors Availability Board"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {(vis?.showWhyChooseSection ?? false) && (
        <section className="py-16 lg:py-20 bg-[#F1F8F3]/70 border-y border-[#37A879]/12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold text-[#37A879]">{t.sections.whyKicker}</div>
              <h2 className="mt-2 font-display font-extrabold text-2xl sm:text-3xl text-[#172F43] tracking-tight text-balance">
                {t.sections.whyTitle}
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-6 gap-5">
              {t.whyItems.map((item, idx) => (
                <div
                  key={item.title}
                  className={`gh-animated-border p-6 flex flex-col justify-between ${
                    idx < 2 ? 'md:col-span-3' : 'md:col-span-2'
                  }`}
                >
                  <div>
                    <div className="font-mono-tabular text-xs font-semibold text-[#37A879]">
                      0{idx + 1}.
                    </div>
                    <h3 className="mt-2 font-display font-bold text-lg text-[#172F43]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#172F43]/72 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(vis?.showServicesSection ?? false) && services.length > 0 && (
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#37A879]">{t.sections.servicesKicker}</div>
                <h2 className="mt-2 font-display font-extrabold text-2xl sm:text-3xl text-[#172F43] tracking-tight">
                  {t.sections.servicesTitle}
                </h2>
              </div>
              <Link
                to="/specialities"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#37A879] hover:text-[#28865E] whitespace-nowrap"
              >
                <span>View all {services.length} services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.slice(0, 6).map((srv, idx) => (
                <div key={srv.id} className="gh-animated-border p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#172F43]/55">
                      <span className="font-medium text-[#37A879]">{srv.category}</span>
                      <span className="font-mono-tabular">0{idx + 1}</span>
                    </div>
                    <h3 className="mt-2.5 font-display font-bold text-lg text-[#172F43]">
                      {srv.name}
                    </h3>
                    <p className="mt-2 text-sm text-[#172F43]/70 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#172F43]/8 flex items-center justify-between gap-3 text-xs">
                    <span className="text-[#172F43]/65 font-mono-tabular">
                      {srv.durationMinutes} min ·{' '}
                      {srv.consultationFee !== null && srv.consultationFee > 0
                        ? `₹${srv.consultationFee}`
                        : srv.feeLabel}
                    </span>
                    <Link
                      to={`/book?serviceId=${srv.id}`}
                      className="font-semibold text-[#37A879] hover:text-[#28865E] whitespace-nowrap"
                    >
                      Book →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* F. INTERACTIVE APPOINTMENT BOOKING SECTION (Optional on Home; dedicated page at /book) */}
      {(vis?.showBookingSection ?? false) && (
        <section id="book-appointment" className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <div className="text-xs font-semibold text-[#37A879]">{t.sections.bookingKicker}</div>
              <h2 className="mt-2 font-display font-extrabold text-2xl sm:text-3xl text-[#172F43] tracking-tight">
                {t.sections.bookingTitle}
              </h2>
            </div>
            <BookingWidget />
          </div>
        </section>
      )}

      {/* G. IN-STORE PHARMACY SECTION (Optional on Home; dedicated page at /pharmacy) */}
      {(vis?.showPharmacySection ?? false) && (
        <section className="py-16 lg:py-20 bg-[#172F43] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="text-xs font-semibold text-[#B9D36A]">{t.sections.pharmacyKicker}</div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight text-balance">
                  {settings?.pharmacyHeadline || 'In-Store Pharmacy Care & Guidance'}
                </h2>
                <p className="text-base text-white/80 leading-relaxed">
                  {settings?.pharmacyDescription}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/8 border border-white/12">
                    <Building2 className="w-5 h-5 text-[#B9D36A] mb-2" />
                    <div className="font-semibold text-sm">Walk-In Counter</div>
                    <p className="text-xs text-white/70 mt-1">
                      Direct in-person assistance at KD Pradhan Road, Kalimpong Bazar.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/8 border border-white/12">
                    <Stethoscope className="w-5 h-5 text-[#B9D36A] mb-2" />
                    <div className="font-semibold text-sm">Doctor Desk Support</div>
                    <p className="text-xs text-white/70 mt-1">
                      On-site coordination for visiting specialist appointments.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/8 border border-white/12">
                    <ShieldCheck className="w-5 h-5 text-[#B9D36A] mb-2" />
                    <div className="font-semibold text-sm">In-Store Policy</div>
                    <p className="text-xs text-white/70 mt-1">
                      Informational portal only — no online drug sales or delivery.
                    </p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden border border-white/15 bg-white/5 p-3">
                  <img
                    src="/assets/aistudio/IMG20261121183635_d5c3d937.jpg"
                    alt="Good Hope Pharmacy Kalimpong storefront signboard"
                    referrerPolicy="no-referrer"
                    className="w-full aspect-[4/3] object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* H. OUR GALLERY (Optional on Home; dedicated page at /gallery) */}
      {(vis?.showGallerySection ?? false) && gallery.length > 0 && (
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <div className="text-xs font-semibold text-[#37A879]">{t.sections.galleryKicker}</div>
                <h2 className="mt-2 font-display font-extrabold text-2xl sm:text-3xl text-[#172F43] tracking-tight">
                  {t.sections.galleryTitle}
                </h2>
              </div>
              <Link
                to="/gallery"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#37A879] hover:text-[#28865E]"
              >
                <span>Open full gallery</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <GalleryGrid items={gallery} />
          </div>
        </section>
      )}

      {/* VERIFIED REVIEWS (Strictly hidden when 0 approved reviews exist) */}
      {(vis?.showReviewsSection ?? true) && reviews.length > 0 && (
        <section className="py-16 bg-[#F1F8F3]/70 border-t border-[#37A879]/12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-xs font-semibold text-[#37A879]">{t.sections.reviewsKicker}</div>
                <h2 className="mt-2 font-display font-extrabold text-2xl sm:text-3xl text-[#172F43]">
                  {t.sections.reviewsTitle}
                </h2>
              </div>
              {settings?.googleReviewUrl && (
                <a
                  href={settings.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#37A879] hover:underline"
                >
                  <span>Share verified review</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {reviews.map((rev) => (
                <div key={rev.id} className="gh-animated-border p-6">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-[#172F43]/80 leading-relaxed">“{rev.comment}”</p>
                  <div className="mt-4 pt-3 border-t border-[#172F43]/8 text-xs">
                    <span className="font-bold text-[#172F43]">{rev.customerName}</span>
                    {rev.sourceLabel && (
                      <>
                        <span className="mx-1.5 text-[#172F43]/35">·</span>
                        <span className="text-[#37A879]">{rev.sourceLabel}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* I. LOCATION AND CONTACT PREVIEW (Optional on Home; dedicated page at /contact) */}
      {(vis?.showContactSection ?? false) && (
        <section className="py-16 lg:py-20 bg-[#F5F7F8] border-t border-[#172F43]/8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-[#172F43]/10 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="text-xs font-semibold text-[#37A879]">{t.sections.contactKicker}</div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#172F43] tracking-tight">
                  {t.sections.contactTitle}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#37A879] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-[#172F43]/55">{t.contact.addressLabel}</div>
                      <div className="font-semibold text-[#172F43] mt-0.5">{plusCode}</div>
                      <div className="text-xs text-[#172F43]/70 mt-1">{settings?.streetAddress}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#37A879] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-[#172F43]/55">{t.contact.phoneLabel}</div>
                      <a
                        href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                        className="font-mono-tabular font-bold text-[#172F43] hover:text-[#37A879] text-base block mt-0.5"
                      >
                        {phone}
                      </a>
                      <div className="text-xs text-[#172F43]/65 mt-1">
                        {t.contact.ownerLabel}: {settings?.ownerName || 'Sudarshan Karkee'}
                      </div>
                    </div>
                  </div>
                </div>
                {!settings?.isMapPinVerified && (
                  <p className="text-xs text-[#172F43]/60 pt-1">{t.contact.mapUnverifiedNote}</p>
                )}
              </div>

              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#37A879] hover:bg-[#28865E] text-white font-semibold text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t.contact.callNow}: {phone}</span>
                </a>
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#F1F8F3] hover:bg-[#e1f1e7] text-[#172F43] border border-[#37A879]/25 font-semibold text-sm transition-colors"
                >
                  <MapPin className="w-4 h-4 text-[#37A879]" />
                  <span>
                    {settings?.isMapPinVerified ? t.contact.openVerifiedMap : t.contact.openMapSearch}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#172F43]/15 text-[#172F43] hover:bg-[#F5F7F8] font-semibold text-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#37A879]" />
                  <span>{t.contact.enquiryTitle}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
