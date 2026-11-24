export type LanguageCode = 'en' | 'bn' | 'ne' | 'hi';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no-show';

export type BusinessHourType = 'pharmacy' | 'doctor_consultation' | 'appointment_booking';

export type GalleryCategory =
  | 'pharmacy_exterior'
  | 'pharmacy_signboard'
  | 'good_hope_logo'
  | 'doctor_board'
  | 'healthcare_environment';

export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  slug: string;
  departmentId: string;
  departmentName: string;
  speciality: string;
  qualifications: string;
  boardDescription: string;
  registrationNumber: string;
  affiliation: string;
  bio: string;
  photoUrl: string | null;
  verificationStatus: 'draft_unverified' | 'verified';
  isVisible: boolean;
  isActive: boolean;
  scheduleConfigured: boolean;
  consultationFeeNote: string;
  displayOrder: number;
  verificationNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  departmentId: string;
  category: string;
  description: string;
  doctorId: string | null;
  durationMinutes: number;
  consultationFee: number | null;
  feeLabel: string;
  availabilityNote: string;
  isActive: boolean;
  isVisible: boolean;
  icon: string;
  imageUrl: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DayAvailability {
  dayOfWeek: number; // 0 = Sun ... 6 = Sat
  dayName: string;
  enabled: boolean;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakStart: string;
  breakEnd: string;
  slotDurationMinutes: number;
  maxDailyBookings: number;
}

export interface DoctorSchedule {
  doctorId: string;
  isConfigured: boolean;
  temporarilyUnavailable: boolean;
  unavailableReason: string;
  holidays: string[]; // YYYY-MM-DD
  weeklyDays: DayAvailability[];
  updatedAt: string;
}

export interface BusinessHourRow {
  id: string;
  scheduleType: BusinessHourType;
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart: string;
  breakEnd: string;
  note: string;
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  doctorId: string | null; // null = whole clinic
  startTime: string | null; // null = full day
  endTime: string | null;
  reason: string;
  isHoliday: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  bookingReference: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  departmentId: string;
  departmentName: string;
  serviceId: string;
  serviceName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm or 'Enquiry'
  endTime: string;
  status: AppointmentStatus;
  customerMessage: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  category: GalleryCategory;
  imageUrl: string;
  isPublished: boolean;
  displayOrder: number;
  uploadedByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  visitContext: string;
  sourceLabel: string;
  isApproved: boolean;
  isVisible: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'appointment_new' | 'appointment_status' | 'contact_enquiry' | 'system';
  title: string;
  message: string;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ContactEnquiry {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  subject: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}

export interface AdminProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  phone: string;
  updatedAt: string;
}

export interface SectionVisibility {
  showAnnouncementBar: boolean;
  showHeroSection: boolean;
  showHeroAnimation: boolean;
  showAboutSection: boolean;
  showOwnerProfile: boolean;
  showWhyChooseSection: boolean;
  showServicesSection: boolean;
  showDoctorsSection: boolean;
  showBookingSection: boolean;
  showPharmacySection: boolean;
  showGallerySection: boolean;
  showReviewsSection: boolean;
  showContactSection: boolean;
  showFacebookLink: boolean;
  showVerifiedMapEmbed: boolean;
  allowPublicBooking: boolean;
}

export interface SiteSettings {
  businessName: string;
  shortName: string;
  businessType: string;
  ownerName: string;
  ownerPhotoUrl: string;
  ownerBio: string;
  phone: string;
  secondaryPhones: string;
  email: string;
  plusCodeAddress: string;
  streetAddress: string;
  googleMapsUrl: string;
  isMapPinVerified: boolean;
  facebookUrl: string;
  googleReviewUrl: string;
  logoUrl: string | null; // null = clean vector GOOD HOPE circular logo
  announcementText: string;
  heroHeadline: string;
  heroSubheading: string;
  heroSupportingText: string;
  aboutHeadline: string;
  aboutDescription: string;
  pharmacyHeadline: string;
  pharmacyDescription: string;
  bookingPausedMessage: string;
  whatsappIntegrationStatus: 'not_configured' | 'configured';
  emailIntegrationStatus: 'not_configured' | 'configured';
  timezone: string;
  visibility: SectionVisibility;
  updatedAt: string;
}

export interface PublicSitePayload {
  settings: SiteSettings;
  departments: Department[];
  doctors: Doctor[];
  services: ServiceItem[];
  gallery: GalleryItem[];
  reviews: ReviewItem[];
  businessHours: BusinessHourRow[];
  blockedDates: BlockedDate[];
  doctorSchedules: Record<string, DoctorSchedule>;
}
