import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SiteProvider } from './hooks/useSiteContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import {
  AboutPage,
  BookAppointmentPage,
  GalleryPage,
  PharmacyPage,
  SpecialitiesPage,
} from './pages/PublicSubPages';
import { ContactPage } from './pages/ContactPage';
import {
  AppointmentPolicyPage,
  CancellationPolicyPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/LegalPages';
import { AdminLoginPage } from './admin/AdminLoginPage';
import { AdminDashboardPage } from './admin/AdminDashboardPage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-white text-[#172F43]">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <SiteProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Separate Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />

          {/* Public Healthcare Website Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/pharmacy" element={<PublicLayout><PharmacyPage /></PublicLayout>} />
          <Route path="/doctors" element={<PublicLayout><DoctorsPage /></PublicLayout>} />
          <Route path="/doctors/:slug" element={<PublicLayout><DoctorDetailPage /></PublicLayout>} />
          <Route path="/specialities" element={<PublicLayout><SpecialitiesPage /></PublicLayout>} />
          <Route path="/book" element={<PublicLayout><BookAppointmentPage /></PublicLayout>} />
          <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
          <Route path="/appointment-policy" element={<PublicLayout><AppointmentPolicyPage /></PublicLayout>} />
          <Route path="/cancellation-policy" element={<PublicLayout><CancellationPolicyPage /></PublicLayout>} />
          <Route path="*" element={<PublicLayout><HomePage /></PublicLayout>} />
        </Routes>
      </BrowserRouter>
    </SiteProvider>
  );
}
