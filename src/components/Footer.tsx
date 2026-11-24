import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useSite } from '../hooks/useSiteContext';
import { GoodHopeLogo } from './GoodHopeLogo';

export const Footer: React.FC = () => {
  const { data, t } = useSite();
  const settings = data?.settings;
  const phone = settings?.phone || '+91 75859 76561';
  const plusCode = settings?.plusCodeAddress || '3FCC+MF, Kalimpong, West Bengal, India';
  const street = settings?.streetAddress || 'KD Pradhan Road, Kalimpong Bazar, Kalimpong, West Bengal 734301';

  return (
    <footer className="bg-[#172F43] text-white/90 pt-14 pb-24 sm:pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-white/12">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <GoodHopeLogo logoUrl={settings?.logoUrl} size={48} />
              <div>
                <div className="font-display font-extrabold text-lg tracking-tight text-white">
                  {settings?.businessName || 'GOOD HOPE PHARMACY'}
                </div>
                <div className="text-xs text-[#B9D36A]">Kalimpong, West Bengal</div>
              </div>
            </div>
            <p className="text-sm text-white/75 leading-relaxed">{t.footer.tagline}</p>
            <div className="text-xs text-white/65">
              {t.contact.ownerLabel}: <span className="text-white/90 font-medium">{settings?.ownerName || 'Sudarshan Karkee'}</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display text-sm font-bold text-white mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li><Link to="/" className="hover:text-[#B9D36A] transition-colors">{t.nav.home}</Link></li>
              <li><Link to="/about" className="hover:text-[#B9D36A] transition-colors">{t.nav.about}</Link></li>
              <li><Link to="/pharmacy" className="hover:text-[#B9D36A] transition-colors">{t.nav.pharmacy}</Link></li>
              <li><Link to="/doctors" className="hover:text-[#B9D36A] transition-colors">{t.nav.doctors}</Link></li>
              <li><Link to="/specialities" className="hover:text-[#B9D36A] transition-colors">{t.nav.specialities}</Link></li>
              <li><Link to="/book" className="hover:text-[#B9D36A] transition-colors">{t.nav.book}</Link></li>
              <li><Link to="/gallery" className="hover:text-[#B9D36A] transition-colors">{t.nav.gallery}</Link></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="font-display text-sm font-bold text-white mb-4">{t.footer.legal}</h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li><Link to="/privacy" className="hover:text-[#B9D36A] transition-colors">{t.footer.privacy}</Link></li>
              <li><Link to="/terms" className="hover:text-[#B9D36A] transition-colors">{t.footer.terms}</Link></li>
              <li><Link to="/appointment-policy" className="hover:text-[#B9D36A] transition-colors">{t.footer.appointmentPolicy}</Link></li>
              <li><Link to="/cancellation-policy" className="hover:text-[#B9D36A] transition-colors">{t.footer.cancellationPolicy}</Link></li>
              <li className="pt-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#37A879]" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact details */}
          <div className="space-y-3 text-sm text-white/75">
            <h3 className="font-display text-sm font-bold text-white mb-4">{t.nav.contact}</h3>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#37A879] mt-0.5 shrink-0" />
              <div>
                <div className="text-white font-medium">{plusCode}</div>
                <div className="text-xs text-white/65 mt-1">{street}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#37A879] shrink-0" />
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                className="font-mono-tabular text-white hover:text-[#B9D36A] transition-colors"
              >
                {phone}
              </a>
            </div>
            {settings?.email && (
              <div className="text-xs text-white/75">Email: {settings.email}</div>
            )}
            {settings?.visibility.showFacebookLink && settings.facebookUrl && (
              <div className="pt-1">
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#B9D36A] hover:underline"
                >
                  Facebook Profile
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-white/60">
          <p className="max-w-2xl leading-relaxed">{t.footer.medicalDisclaimer}</p>
          <p className="whitespace-nowrap">
            © {new Date().getFullYear()} {settings?.businessName || 'GOOD HOPE PHARMACY'}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};
