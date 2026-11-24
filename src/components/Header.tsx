import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, Phone, X } from 'lucide-react';
import { useSite } from '../hooks/useSiteContext';
import { LANGUAGES } from '../lib/i18n';
import { GoodHopeLogo } from './GoodHopeLogo';

export const Header: React.FC = () => {
  const { data, language, setLanguage, t } = useSite();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const settings = data?.settings;
  const phone = settings?.phone || '+91 75859 76561';
  const telHref = `tel:${phone.replace(/[^0-9+]/g, '')}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/', label: t.nav.home },
    { to: '/about', label: t.nav.about },
    { to: '/pharmacy', label: t.nav.pharmacy },
    { to: '/doctors', label: t.nav.doctors },
    { to: '/specialities', label: t.nav.specialities },
    { to: '/gallery', label: t.nav.gallery },
    { to: '/contact', label: t.nav.contact },
  ];

  const activeLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <>
      {settings?.visibility.showAnnouncementBar && settings.announcementText && (
        <div className="bg-[#172F43] text-white text-xs sm:text-sm py-2 px-4 text-center">
          <div className="max-w-7xl mx-auto">{settings.announcementText}</div>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[#172F43]/10 shadow-[0_6px_24px_-18px_rgba(23,47,67,0.25)]'
            : 'bg-white border-b border-[#172F43]/8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[74px] flex items-center justify-between gap-6">
          {/* Zone 1: Brand mark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#37A879] rounded-lg"
          >
            <GoodHopeLogo logoUrl={settings?.logoUrl} size={44} />
            <span className="font-display font-extrabold text-lg tracking-tight text-[#172F43] whitespace-nowrap">
              <span className="text-[#37A879]">GOOD</span> HOPE
            </span>
          </Link>

          {/* Zone 2: Clean single-line navigation links */}
          <nav
            aria-label="Main Navigation"
            className="hidden xl:flex items-center gap-6 text-sm font-medium text-[#172F43]/80"
          >
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'text-[#37A879] font-semibold'
                      : 'hover:text-[#172F43]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-[#37A879] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Language switcher & Primary Book CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((o) => !o)}
                aria-label="Select Language"
                aria-expanded={langOpen}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#172F43] bg-[#F5F7F8] hover:bg-[#F1F8F3] border border-[#172F43]/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Globe className="w-3.5 h-3.5 text-[#37A879]" />
                <span>{activeLang.nativeLabel}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl border border-[#172F43]/12 shadow-lg py-1.5 z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        language === lang.code
                          ? 'bg-[#F1F8F3] text-[#37A879] font-semibold'
                          : 'text-[#172F43] hover:bg-[#F5F7F8]'
                      }`}
                    >
                      <span>{lang.label}</span>
                      <span className="text-[11px] opacity-75">{lang.nativeLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/book"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#37A879] hover:bg-[#28865E] rounded-xl gh-cta-outline whitespace-nowrap shrink-0 transition-colors"
            >
              {t.nav.book}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle Menu"
              className="xl:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#172F43]/12 text-[#172F43] hover:bg-[#F5F7F8] cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="xl:hidden bg-white border-t border-[#172F43]/10 px-4 pt-3 pb-5 shadow-lg">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3.5 py-3 rounded-lg text-sm font-medium ${
                      active
                        ? 'bg-[#F1F8F3] text-[#37A879] font-semibold'
                        : 'text-[#172F43] hover:bg-[#F5F7F8]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/book"
                className="mt-2 px-4 py-3 text-center rounded-xl text-sm font-semibold text-white bg-[#37A879] hover:bg-[#28865E]"
              >
                {t.nav.book}
              </Link>
              <a
                href={telHref}
                className="mt-1 px-4 py-3 text-center rounded-xl text-sm font-semibold text-[#172F43] bg-[#F5F7F8] border border-[#172F43]/10 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#37A879]" />
                <span>{phone}</span>
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Compact Mobile Bottom Action Bar (strictly < 8% of mobile viewport) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#172F43]/12 px-3 py-2 flex items-center gap-2">
        <a
          href={telHref}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#F1F8F3] text-[#172F43] text-xs font-semibold border border-[#37A879]/25 whitespace-nowrap"
        >
          <Phone className="w-3.5 h-3.5 text-[#37A879]" />
          <span>{t.contact.callNow}</span>
        </a>
        <Link
          to="/book"
          className="flex-[1.35] inline-flex items-center justify-center py-2.5 px-3 rounded-xl bg-[#37A879] text-white text-xs font-semibold whitespace-nowrap"
        >
          {t.nav.book}
        </Link>
      </div>
    </>
  );
};
