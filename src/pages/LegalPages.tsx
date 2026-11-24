import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../hooks/useSiteContext';

const LegalShell: React.FC<{ title: string; updated: string; children: React.ReactNode }> = ({
  title,
  updated,
  children,
}) => (
  <div className="py-12 lg:py-16 bg-white">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="pb-5 border-b border-[#172F43]/10">
        <div className="text-xs font-semibold text-[#37A879]">Good Hope Pharmacy · Kalimpong</div>
        <h1 className="mt-2 font-display font-extrabold text-3xl text-[#172F43] tracking-tight">
          {title}
        </h1>
        <p className="mt-1 text-xs text-[#172F43]/55">Effective: {updated}</p>
      </div>
      <div className="space-y-5 text-sm sm:text-base text-[#172F43]/80 leading-relaxed">
        {children}
      </div>
      <div className="pt-6 border-t border-[#172F43]/10 flex flex-wrap gap-4 text-xs font-semibold text-[#37A879]">
        <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
        <Link to="/appointment-policy" className="hover:underline">Appointment Policy</Link>
        <Link to="/cancellation-policy" className="hover:underline">Cancellation Policy</Link>
      </div>
    </div>
  </div>
);

export const PrivacyPolicyPage: React.FC = () => {
  const { data } = useSite();
  const phone = data?.settings.phone || '+91 75859 76561';
  return (
    <LegalShell title="Privacy Policy" updated="November 2026">
      <p>
        Good Hope Pharmacy, Kalimpong respects your privacy. This website collects only the minimum
        contact details necessary to process appointment enquiries and general questions (such as
        your full name, mobile number, optional email, and selected appointment preference).
      </p>
      <h2 className="font-display font-bold text-lg text-[#172F43]">Minimal Information Principle</h2>
      <p>
        We do not ask for, and visitors should not upload or enter, sensitive medical records,
        diagnostic reports, or detailed clinical history through online forms on this website.
      </p>
      <h2 className="font-display font-bold text-lg text-[#172F43]">Data Access & Security</h2>
      <p>
        Customer contact details and appointment records are kept private and accessible solely to
        authorized Good Hope Pharmacy administrators for managing appointments. Public visitors can
        never view another customer’s details or appointment history.
      </p>
      <h2 className="font-display font-bold text-lg text-[#172F43]">Contact for Privacy Requests</h2>
      <p>
        To update or delete your contact details from our enquiry register, please call Good Hope
        Pharmacy at <span className="font-mono-tabular font-semibold">{phone}</span>.
      </p>
    </LegalShell>
  );
};

export const TermsPage: React.FC = () => (
  <LegalShell title="Terms & Conditions" updated="November 2026">
    <p>
      By using the Good Hope Pharmacy website, you acknowledge that this platform serves strictly as
      an informational directory and doctor consultation appointment enquiry desk for Good Hope
      Pharmacy, Kalimpong.
    </p>
    <h2 className="font-display font-bold text-lg text-[#172F43]">No Medical Diagnosis or Online Medicine Sales</h2>
    <p>
      Nothing on this website constitutes medical diagnosis, clinical advice, or a prescription.
      Good Hope Pharmacy does not conduct online sales of prescription medicines, online drug
      ordering, or medicine delivery through this portal.
    </p>
    <h2 className="font-display font-bold text-lg text-[#172F43]">Doctor Profiles & Schedules</h2>
    <p>
      Doctor qualifications, registrations, and consultation timings are maintained by Good Hope
      Pharmacy administration and may be updated whenever visiting specialist schedules change.
    </p>
  </LegalShell>
);

export const AppointmentPolicyPage: React.FC = () => (
  <LegalShell title="Appointment Policy" updated="November 2026">
    <p>
      Submitting an online appointment request generates a unique booking reference with status{' '}
      <strong>PENDING</strong>. An appointment is considered <strong>CONFIRMED</strong> only after
      Good Hope Pharmacy administration reviews doctor availability and confirms the slot.
    </p>
    <p>
      Consultation schedules operate in the <strong>Asia/Kolkata (IST)</strong> timezone. Because
      visiting doctors may attend hospital emergencies, timings may occasionally be adjusted by our
      desk with prior notice to the mobile number provided.
    </p>
  </LegalShell>
);

export const CancellationPolicyPage: React.FC = () => {
  const { data } = useSite();
  const phone = data?.settings.phone || '+91 75859 76561';
  return (
    <LegalShell title="Cancellation & Rescheduling Policy" updated="November 2026">
      <p>
        If you need to cancel or reschedule a requested or confirmed doctor consultation, please
        inform Good Hope Pharmacy as early as possible by calling{' '}
        <span className="font-mono-tabular font-semibold">{phone}</span> with your booking
        reference number so the slot can be offered to another patient.
      </p>
      <p>
        Good Hope Pharmacy does not collect online prepayment through this website; any consultation
        fee is settled directly at the clinic counter as applicable.
      </p>
    </LegalShell>
  );
};
