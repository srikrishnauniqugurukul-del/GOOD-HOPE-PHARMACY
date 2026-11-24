import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AdminProfile,
  Appointment,
  AppointmentStatus,
  AuditLog,
  BlockedDate,
  BusinessHourRow,
  ContactEnquiry,
  Customer,
  DayAvailability,
  Department,
  Doctor,
  DoctorSchedule,
  GalleryItem,
  NotificationItem,
  PublicSitePayload,
  ReviewItem,
  ServiceItem,
  SiteSettings,
} from '../../src/types/domain.ts';

const IS_SERVERLESS = Boolean(
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL
);
const BUNDLED_DATA_DIR = path.resolve(process.cwd(), 'data');
const BUNDLED_STORE_PATH = path.resolve(BUNDLED_DATA_DIR, 'goodhope-store.json');
export const BUNDLED_UPLOADS_DIR = path.resolve(BUNDLED_DATA_DIR, 'uploads');

const DATA_DIR = IS_SERVERLESS ? path.resolve('/tmp', 'good-hope-data') : BUNDLED_DATA_DIR;
const STORE_PATH = path.resolve(DATA_DIR, 'goodhope-store.json');
export const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');

export interface AdminAuthRecord {
  username: string;
  email: string;
  passwordHash: string; // scrypt salt:derivedKey
  claimedAt: string;
  updatedAt?: string;
}

export interface PersistedDatabase {
  adminAuth: AdminAuthRecord | null;
  adminProfile: AdminProfile;
  settings: SiteSettings;
  departments: Department[];
  doctors: Doctor[];
  services: ServiceItem[];
  doctorSchedules: Record<string, DoctorSchedule>;
  businessHours: BusinessHourRow[];
  blockedDates: BlockedDate[];
  customers: Customer[];
  appointments: Appointment[];
  gallery: GalleryItem[];
  reviews: ReviewItem[];
  notifications: NotificationItem[];
  contactEnquiries: ContactEnquiry[];
  auditLogs: AuditLog[];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function nowIso(): string {
  return new Date().toISOString();
}

function makeDefaultWeeklyDays(): DayAvailability[] {
  return DAY_NAMES.map((dayName, dayOfWeek) => ({
    dayOfWeek,
    dayName,
    enabled: false,
    startTime: '10:00',
    endTime: '13:00',
    breakStart: '',
    breakEnd: '',
    slotDurationMinutes: 15,
    maxDailyBookings: 20,
  }));
}

function makeDefaultBusinessHours(): BusinessHourRow[] {
  const types: Array<'pharmacy' | 'doctor_consultation' | 'appointment_booking'> = [
    'pharmacy',
    'doctor_consultation',
    'appointment_booking',
  ];
  const rows: BusinessHourRow[] = [];
  for (const scheduleType of types) {
    for (let d = 0; d < 7; d++) {
      rows.push({
        id: `${scheduleType}-${d}`,
        scheduleType,
        dayOfWeek: d,
        dayName: DAY_NAMES[d],
        isOpen: false,
        openTime: '',
        closeTime: '',
        breakStart: '',
        breakEnd: '',
        note: 'Pending owner confirmation',
      });
    }
  }
  return rows;
}

function createInitialDatabase(): PersistedDatabase {
  const ts = nowIso();

  const departments: Department[] = [
    {
      id: 'dept-ent',
      name: 'ENT & Head-Neck Surgery',
      slug: 'ent-head-neck-surgery',
      description: 'Specialist consultation for Ear, Nose, Throat, Vertigo, Balance & Head-Neck care.',
      icon: 'ear',
      isActive: true,
      displayOrder: 1,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'dept-gynae',
      name: 'Gynaecology & Obstetrics',
      slug: 'gynaecology-obstetrics',
      description: 'Women’s health, obstetrics, laparoscopic surgery, and infertility consultations.',
      icon: 'heart-pulse',
      isActive: true,
      displayOrder: 2,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'dept-pediatrics',
      name: 'Child Specialist & Pediatrics',
      slug: 'child-specialist-pediatrics',
      description: 'Pediatric healthcare, child physician visits, and neonatology consultations.',
      icon: 'baby',
      isActive: true,
      displayOrder: 3,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'dept-medicine',
      name: 'Physician / Internal Medicine',
      slug: 'physician-internal-medicine',
      description: 'Adult internal medicine and general physician consultations.',
      icon: 'stethoscope',
      isActive: true,
      displayOrder: 4,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'dept-physiology',
      name: 'Physiology',
      slug: 'physiology',
      description: 'Speciality label transcribed from clinic board; verify final designation before publishing.',
      icon: 'activity',
      isActive: true,
      displayOrder: 5,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'dept-surgery',
      name: 'General Surgery',
      slug: 'general-surgery',
      description: 'General surgical evaluation and consultation appointments.',
      icon: 'shield-plus',
      isActive: true,
      displayOrder: 6,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'dept-pharmacy',
      name: 'Pharmacy Information & Enquiry',
      slug: 'pharmacy-information-enquiry',
      description: 'In-store pharmacy information and customer enquiries (informational only).',
      icon: 'pill',
      isActive: true,
      displayOrder: 7,
      createdAt: ts,
      updatedAt: ts,
    },
  ];

  const doctors: Doctor[] = [
    {
      id: 'doc-dk-gupta',
      name: 'Dr. D.K. Gupta',
      slug: 'dr-d-k-gupta',
      departmentId: 'dept-ent',
      departmentName: 'ENT & Head-Neck Surgery',
      speciality: 'ENT & Head-Neck Surgery',
      qualifications: 'Consultant ENT & Head-Neck Surgeon',
      boardDescription:
        'Consultant ENT & Head-Neck Surgeon. Expert in Vertigo, Ear Disorders & Balance Treatment.',
      registrationNumber: 'WBMC-68227',
      affiliation: 'District Hospital, Kalimpong',
      bio: 'Listed on the Good Hope Pharmacy doctor board for ENT, Head-Neck Surgery, Vertigo, Ear Disorders, and Balance consultations.',
      photoUrl: null,
      verificationStatus: 'draft_unverified',
      verificationNote: 'Transcribed from clinic board. Verify qualifications, registration & timings in Admin.',
      isVisible: true,
      isActive: true,
      scheduleConfigured: false,
      consultationFeeNote: 'Confirm at counter',
      displayOrder: 1,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'doc-sanjay-mazumder',
      name: 'Dr. Sanjay Mazumder',
      slug: 'dr-sanjay-mazumder',
      departmentId: 'dept-gynae',
      departmentName: 'Gynaecology & Obstetrics',
      speciality: 'Gynaecology & Obstetrics',
      qualifications: 'M.B.B.S., MS (OBST & GYNAE), FART, FMAS (DELHI), WBHS',
      boardDescription:
        'Consultant: Gynaecologist, Obstetrician, Laparoscopic Surgeon & Infertility Specialist.',
      registrationNumber: '',
      affiliation: '',
      bio: 'Listed on the Good Hope Pharmacy doctor board for Gynaecology, Obstetrics, Laparoscopic Surgery, and Infertility consultations.',
      photoUrl: null,
      verificationStatus: 'draft_unverified',
      verificationNote: 'Preserve printed qualifications for owner/doctor verification before marking Verified.',
      isVisible: true,
      isActive: true,
      scheduleConfigured: false,
      consultationFeeNote: 'Confirm at counter',
      displayOrder: 2,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'doc-ibrahim-shakuli',
      name: 'Dr. Ibrahim Shakuli',
      slug: 'dr-ibrahim-shakuli',
      departmentId: 'dept-ent',
      departmentName: 'ENT & Head-Neck Surgery',
      speciality: 'ENT',
      qualifications: 'MBBS, MS (ENT), Kolkata',
      boardDescription: 'Consultant ENT Surgeon.',
      registrationNumber: 'WBMC-55496',
      affiliation: 'District Hospital, Kalimpong',
      bio: 'Listed on the Good Hope Pharmacy doctor board as Consultant ENT Surgeon.',
      photoUrl: null,
      verificationStatus: 'draft_unverified',
      verificationNote: 'Verify registration and consultation timings before marking Verified.',
      isVisible: true,
      isActive: true,
      scheduleConfigured: false,
      consultationFeeNote: 'Confirm at counter',
      displayOrder: 3,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'doc-ayan-dutta',
      name: 'Dr. Ayan Dutta',
      slug: 'dr-ayan-dutta',
      departmentId: 'dept-pediatrics',
      departmentName: 'Child Specialist & Pediatrics',
      speciality: 'Child Specialist & Physician',
      qualifications: 'MBBS, MD (Pediatrics)',
      boardDescription: 'Child Specialist & Physician. Pediatrician & Neonatologist.',
      registrationNumber: '',
      affiliation: 'District Hospital, Kalimpong',
      bio: 'Listed on the Good Hope Pharmacy doctor board for Child Specialist, Pediatrician, and Neonatology consultations.',
      photoUrl: null,
      verificationStatus: 'draft_unverified',
      verificationNote: 'Verify registration details and consultation schedule before marking Verified.',
      isVisible: true,
      isActive: true,
      scheduleConfigured: false,
      consultationFeeNote: 'Confirm at counter',
      displayOrder: 4,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'doc-ro-karthak',
      name: 'Dr. R.O. Karthak',
      slug: 'dr-r-o-karthak',
      departmentId: 'dept-medicine',
      departmentName: 'Physician / Internal Medicine',
      speciality: 'Physician / Internal Medicine',
      qualifications: 'MBBS, Medical College NRS (Kolkata), M.D. Medicine (Physician)',
      boardDescription: 'Physician / Internal Medicine.',
      registrationNumber: 'WBMC-59257',
      affiliation: 'District Hospital, Kalimpong',
      bio: 'Listed on the Good Hope Pharmacy doctor board for Physician and Internal Medicine consultations.',
      photoUrl: null,
      verificationStatus: 'draft_unverified',
      verificationNote: 'Verify registration and consultation hours before marking Verified.',
      isVisible: true,
      isActive: true,
      scheduleConfigured: false,
      consultationFeeNote: 'Confirm at counter',
      displayOrder: 5,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'doc-swarup-khan',
      name: 'Dr. Swarup Kumar Khan',
      slug: 'dr-swarup-kumar-khan',
      departmentId: 'dept-physiology',
      departmentName: 'Physiology',
      speciality: 'Physiologist',
      qualifications: 'MBBS',
      boardDescription: 'Physiologist (exact speciality label printed on the board).',
      registrationNumber: '',
      affiliation: 'District Hospital, Kalimpong',
      bio: 'Listed on the Good Hope Pharmacy doctor board. Exact professional speciality designation should be verified with the doctor before final publication.',
      photoUrl: null,
      verificationStatus: 'draft_unverified',
      verificationNote: 'IMPORTANT: Verify exact professional speciality designation with the doctor before publishing as Verified.',
      isVisible: true,
      isActive: true,
      scheduleConfigured: false,
      consultationFeeNote: 'Confirm at counter',
      displayOrder: 6,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'doc-krishanu-sarkar',
      name: 'Dr. Krishanu Sarkar',
      slug: 'dr-krishanu-sarkar',
      departmentId: 'dept-gynae',
      departmentName: 'Gynaecology & Obstetrics',
      speciality: 'Gynaecology & Obstetrics',
      qualifications: 'MBBS (Kolkata), DNB (G&O)',
      boardDescription: 'Gynae, Obs & Infertility Specialist.',
      registrationNumber: '',
      affiliation: '',
      bio: 'Listed on the Good Hope Pharmacy doctor board for Gynaecology, Obstetrics, and Infertility consultations.',
      photoUrl: null,
      verificationStatus: 'draft_unverified',
      verificationNote: 'Verify credentials and consultation hours before marking Verified.',
      isVisible: true,
      isActive: true,
      scheduleConfigured: false,
      consultationFeeNote: 'Confirm at counter',
      displayOrder: 7,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'doc-ramkrishna-karmakar',
      name: 'Dr. Ramkrishna Karmakar',
      slug: 'dr-ramkrishna-karmakar',
      departmentId: 'dept-surgery',
      departmentName: 'General Surgery',
      speciality: 'General Surgeon',
      qualifications: '',
      boardDescription: 'General Surgeon.',
      registrationNumber: '',
      affiliation: '',
      bio: 'Listed on the Good Hope Pharmacy doctor board as General Surgeon.',
      photoUrl: null,
      verificationStatus: 'draft_unverified',
      verificationNote: 'Verify qualifications, registration, and timings with the doctor before marking Verified.',
      isVisible: true,
      isActive: true,
      scheduleConfigured: false,
      consultationFeeNote: 'Confirm at counter',
      displayOrder: 8,
      createdAt: ts,
      updatedAt: ts,
    },
  ];

  const services: ServiceItem[] = [
    {
      id: 'srv-1',
      name: 'ENT & Head-Neck Consultation',
      departmentId: 'dept-ent',
      category: 'ENT & Head-Neck Surgery',
      description: 'Outpatient consultation for ear, nose, throat, and head-neck concerns.',
      doctorId: 'doc-dk-gupta',
      durationMinutes: 20,
      consultationFee: null,
      feeLabel: 'Confirm at pharmacy desk',
      availabilityNote: 'Timings confirmed upon appointment request',
      isActive: true,
      isVisible: true,
      icon: 'ear',
      imageUrl: null,
      displayOrder: 1,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'srv-2',
      name: 'Vertigo, Ear Disorders & Balance Consultation',
      departmentId: 'dept-ent',
      category: 'ENT & Head-Neck Surgery',
      description: 'Specialist evaluation for vertigo, ear disorders, and balance symptoms.',
      doctorId: 'doc-dk-gupta',
      durationMinutes: 20,
      consultationFee: null,
      feeLabel: 'Confirm at pharmacy desk',
      availabilityNote: 'Timings confirmed upon appointment request',
      isActive: true,
      isVisible: true,
      icon: 'compass',
      imageUrl: null,
      displayOrder: 2,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'srv-3',
      name: 'Gynaecology Consultation',
      departmentId: 'dept-gynae',
      category: 'Gynaecology & Obstetrics',
      description: 'Women’s reproductive health and gynaecological specialist consultation.',
      doctorId: 'doc-sanjay-mazumder',
      durationMinutes: 20,
      consultationFee: null,
      feeLabel: 'Confirm at pharmacy desk',
      availabilityNote: 'Timings confirmed upon appointment request',
      isActive: true,
      isVisible: true,
      icon: 'heart-pulse',
      imageUrl: null,
      displayOrder: 3,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'srv-4',
      name: 'Obstetrics Consultation',
      departmentId: 'dept-gynae',
      category: 'Gynaecology & Obstetrics',
      description: 'Antenatal and maternal care consultations with obstetric specialists.',
      doctorId: 'doc-sanjay-mazumder',
      durationMinutes: 20,
      consultationFee: null,
      feeLabel: 'Confirm at pharmacy desk',
      availabilityNote: 'Timings confirmed upon appointment request',
      isActive: true,
      isVisible: true,
      icon: 'heart-handshake',
      imageUrl: null,
      displayOrder: 4,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'srv-5',
      name: 'Laparoscopic Surgery Consultation',
      departmentId: 'dept-gynae',
      category: 'Gynaecology & Obstetrics',
      description: 'Specialist pre-operative and laparoscopic surgical consultation.',
      doctorId: 'doc-sanjay-mazumder',
      durationMinutes: 25,
      consultationFee: null,
      feeLabel: 'Confirm at pharmacy desk',
      availabilityNote: 'Timings confirmed upon appointment request',
      isActive: true,
      isVisible: true,
      icon: 'microscope',
      imageUrl: null,
      displayOrder: 5,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'srv-6',
      name: 'Infertility Consultation',
      departmentId: 'dept-gynae',
      category: 'Gynaecology & Obstetrics',
      description: 'Private consultation and guidance for fertility and reproductive care.',
      doctorId: 'doc-krishanu-sarkar',
      durationMinutes: 25,
      consultationFee: null,
      feeLabel: 'Confirm at pharmacy desk',
      availabilityNote: 'Timings confirmed upon appointment request',
      isActive: true,
      isVisible: true,
      icon: 'sparkles',
      imageUrl: null,
      displayOrder: 6,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'srv-7',
      name: 'Child Specialist Consultation',
      departmentId: 'dept-pediatrics',
      category: 'Child Specialist & Pediatrics',
      description: 'General health check-ups and consultations for infants, children, and adolescents.',
      doctorId: 'doc-ayan-dutta',
      durationMinutes: 20,
      consultationFee: null,
      feeLabel: 'Confirm at pharmacy desk',
      availabilityNote: 'Timings confirmed upon appointment request',
      isActive: true,
      isVisible: true,
      icon: 'baby',
      imageUrl: null,
      displayOrder: 7,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'srv-8',
      name: 'Pediatrics & Neonatology Consultation',
      departmentId: 'dept-pediatrics',
      category: 'Child Specialist & Pediatrics',
      description: 'Newborn and pediatric specialist consultation appointments.',
      doctorId: 'doc-ayan-dutta',
      durationMinutes: 20,
      consultationFee: null,
      feeLabel: 'Confirm at pharmacy desk',
      availabilityNote: 'Timings confirmed upon appointment request',
      isActive: true,
      isVisible: true,
      icon: 'shield-check',
      imageUrl: null,
      displayOrder: 8,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'srv-9',
      name: 'Physician / Internal Medicine Consultation',
      departmentId: 'dept-medicine',
      category: 'Physician / Internal Medicine',
      description: 'Comprehensive adult physician and internal medicine consultations.',
      doctorId: 'doc-ro-karthak',
      durationMinutes: 20,
      consultationFee: null,
      feeLabel: 'Confirm at pharmacy desk',
      availabilityNote: 'Timings confirmed upon appointment request',
      isActive: true,
      isVisible: true,
      icon: 'stethoscope',
      imageUrl: null,
      displayOrder: 9,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'srv-10',
      name: 'General Surgery Consultation',
      departmentId: 'dept-surgery',
      category: 'General Surgery',
      description: 'Outpatient surgical evaluation and follow-up consultations.',
      doctorId: 'doc-ramkrishna-karmakar',
      durationMinutes: 20,
      consultationFee: null,
      feeLabel: 'Confirm at pharmacy desk',
      availabilityNote: 'Timings confirmed upon appointment request',
      isActive: true,
      isVisible: true,
      icon: 'shield-plus',
      imageUrl: null,
      displayOrder: 10,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'srv-11',
      name: 'Pharmacy Information & Customer Enquiry',
      departmentId: 'dept-pharmacy',
      category: 'Pharmacy Information & Enquiry',
      description: 'In-store pharmacy information and customer assistance desk (informational only; no online medicine ordering).',
      doctorId: null,
      durationMinutes: 15,
      consultationFee: 0,
      feeLabel: 'Walk-in enquiry',
      availabilityNote: 'During pharmacy opening hours',
      isActive: true,
      isVisible: true,
      icon: 'pill',
      imageUrl: null,
      displayOrder: 11,
      createdAt: ts,
      updatedAt: ts,
    },
  ];

  const doctorSchedules: Record<string, DoctorSchedule> = {};
  for (const doc of doctors) {
    doctorSchedules[doc.id] = {
      doctorId: doc.id,
      isConfigured: false,
      temporarilyUnavailable: false,
      unavailableReason: '',
      holidays: [],
      weeklyDays: makeDefaultWeeklyDays(),
      updatedAt: ts,
    };
  }

  const gallery: GalleryItem[] = [
    {
      id: 'gal-signboard',
      title: 'Good Hope Pharmacy Circular Signboard',
      caption: 'Illuminated GOOD HOPE Pharmacy signboard welcoming visitors in Kalimpong.',
      category: 'pharmacy_signboard',
      imageUrl: '/assets/aistudio/IMG20261121183635_d5c3d937.jpg',
      isPublished: true,
      displayOrder: 1,
      uploadedByAdmin: false,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'gal-doctor-board',
      title: 'Visiting Specialist Doctors Board',
      caption: 'Doctor availability standee at Good Hope Pharmacy, KD Pradhan Road, Kalimpong.',
      category: 'doctor_board',
      imageUrl: '/assets/aistudio/IMG20261121183620_98b52b2e.jpg',
      isPublished: true,
      displayOrder: 2,
      uploadedByAdmin: false,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'gal-owner',
      title: 'Sudarshan Karkee — Business Owner',
      caption: 'Owner of Good Hope Pharmacy, Kalimpong (toggle visibility anytime in Admin Gallery).',
      category: 'healthcare_environment',
      imageUrl: '/assets/aistudio/44759261_2348821421813613_675233253375868928_n_c00d4ccd.jpg',
      isPublished: true,
      displayOrder: 3,
      uploadedByAdmin: false,
      createdAt: ts,
      updatedAt: ts,
    },
  ];

  const settings: SiteSettings = {
    businessName: 'GOOD HOPE PHARMACY',
    shortName: 'GOOD HOPE',
    businessType: 'PHARMACY',
    ownerName: 'Sudarshan Karkee',
    ownerPhotoUrl: '/assets/aistudio/44759261_2348821421813613_675233253375868928_n_c00d4ccd.jpg',
    ownerBio:
      'Committed to approachable, dependable in-store pharmacy care and smooth doctor consultation coordination for families across Kalimpong.',
    phone: '+91 75859 76561',
    secondaryPhones: '',
    email: '',
    plusCodeAddress: '3FCC+MF, Kalimpong, West Bengal, India',
    streetAddress: 'KD Pradhan Road, Kalimpong Bazar, Kalimpong, West Bengal 734301',
    googleMapsUrl: '',
    isMapPinVerified: false,
    facebookUrl: 'https://www.facebook.com/sudarshan.karkee/about',
    googleReviewUrl: '',
    logoUrl: null,
    announcementText:
      'Doctor consultation appointment requests are now open online. Call +91 75859 76561 for immediate desk assistance.',
    heroHeadline: 'GOOD HEALTH. GOOD CARE. GOOD HOPE.',
    heroSubheading: 'Your trusted healthcare destination in Kalimpong.',
    heroSupportingText:
      'Discover convenient pharmacy services and doctor consultation appointments at Good Hope Pharmacy.',
    aboutHeadline: 'Accessible Pharmacy Care & Specialist Consultations in Kalimpong',
    aboutDescription:
      'Good Hope Pharmacy combines an approachable neighbourhood pharmacy counter with organized specialist doctor consultation enquiries under one roof at Kalimpong Bazar. Patients and families can visit us in-store for pharmacy guidance and schedule consultation visits across multiple medical specialities.',
    pharmacyHeadline: 'In-Store Pharmacy Care & Guidance',
    pharmacyDescription:
      'Visit our pharmacy counter at KD Pradhan Road, Kalimpong Bazar for polite, attentive in-person customer service. Please note that Good Hope Pharmacy is an in-store healthcare facility — we do not operate online medicine sales, home drug delivery, or digital prescription refills.',
    bookingPausedMessage:
      'Online appointment booking is temporarily paused. Please call +91 75859 76561 during pharmacy hours.',
    whatsappIntegrationStatus: 'not_configured',
    emailIntegrationStatus: 'not_configured',
    timezone: 'Asia/Kolkata',
    visibility: {
      showAnnouncementBar: false,
      showHeroSection: true,
      showHeroAnimation: true,
      showAboutSection: false,
      showOwnerProfile: true,
      showWhyChooseSection: false,
      showServicesSection: false,
      showDoctorsSection: true,
      showBookingSection: false,
      showPharmacySection: false,
      showGallerySection: false,
      showReviewsSection: true,
      showContactSection: false,
      showFacebookLink: false, // Owner approval required before displaying publicly
      showVerifiedMapEmbed: false, // Only enable once owner verifies Good Hope pin
      allowPublicBooking: true,
    },
    updatedAt: ts,
  };

  return {
    adminAuth: null,
    adminProfile: {
      id: 'admin-owner-1',
      fullName: 'Sudarshan Karkee',
      username: '',
      email: '',
      role: 'Owner & Administrator',
      phone: '+91 75859 76561',
      updatedAt: ts,
    },
    settings,
    departments,
    doctors,
    services,
    doctorSchedules,
    businessHours: makeDefaultBusinessHours(),
    blockedDates: [],
    customers: [],
    appointments: [],
    gallery,
    reviews: [], // Strictly empty until genuine verified reviews are added & approved
    notifications: [],
    contactEnquiries: [],
    auditLogs: [
      {
        id: 'audit-init',
        actor: 'System',
        action: 'INITIALIZE',
        entityType: 'system',
        entityId: 'good-hope-pharmacy',
        summary: 'Initialized Good Hope Pharmacy directory with 8 clinic-board doctor records in draft/unverified state.',
        createdAt: ts,
      },
    ],
  };
}

class GoodHopeStore {
  private db: PersistedDatabase;
  private supabase: SupabaseClient | null = null;
  private supabaseReady = false;
  private supabaseSyncWarned = false;
  private writeQueue: Promise<void> = Promise.resolve();
  private lastRemotePullAt = 0;

  constructor() {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (err) {
      console.warn('Unable to initialize local data directory:', err);
    }

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
      this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
        auth: { persistSession: false },
      });
    }

    this.db = this.loadFromDisk();
    if (this.supabase) {
      void this.syncFromSupabase(true);
    }
  }

  public getStorageBackendMode(): 'supabase' | 'local_server_db' {
    return this.supabase && this.supabaseReady ? 'supabase' : 'local_server_db';
  }

  public async syncFromSupabase(force = false): Promise<void> {
    if (!this.supabase) return;
    const now = Date.now();
    if (!force && now - this.lastRemotePullAt < 3000) return;
    this.lastRemotePullAt = now;

    try {
      const { data, error } = await this.supabase
        .from('app_shared_state')
        .select('payload')
        .eq('state_key', 'good_hope_primary')
        .maybeSingle();

      if (error) {
        if (!this.supabaseSyncWarned) {
          this.supabaseSyncWarned = true;
          console.warn('Supabase app_shared_state sync skipped (run 001_initial_schema.sql):', error.message);
        }
        return;
      }

      this.supabaseReady = true;
      if (data?.payload && typeof data.payload === 'object') {
        const remote = data.payload as PersistedDatabase;
        if (remote.settings && Array.isArray(remote.doctors)) {
          this.db = this.normalizeDb(remote);
          this.saveSync(this.db);
        }
      } else {
        // First push of local state into Supabase
        await this.pushToSupabase(this.db);
      }
    } catch (err) {
      if (!this.supabaseSyncWarned) {
        this.supabaseSyncWarned = true;
        console.warn('Supabase sync unavailable, using local server store:', err);
      }
    }
  }

  private async pushToSupabase(data: PersistedDatabase): Promise<void> {
    if (!this.supabase) return;
    try {
      const { error } = await this.supabase
        .from('app_shared_state')
        .upsert(
          {
            state_key: 'good_hope_primary',
            payload: data,
            updated_at: nowIso(),
          },
          { onConflict: 'state_key' }
        );
      if (!error) {
        this.supabaseReady = true;
      }
    } catch {
      // Keep local server store authoritative if remote sync is transiently unavailable
    }
  }

  private normalizeDb(parsed: PersistedDatabase): PersistedDatabase {
    if (parsed.adminProfile && typeof parsed.adminProfile.username !== 'string') {
      parsed.adminProfile.username = parsed.adminAuth?.username || '';
    }
    if (parsed.adminAuth && typeof parsed.adminAuth.username !== 'string') {
      parsed.adminAuth.username = parsed.adminAuth.email.split('@')[0] || 'admin';
    }
    return parsed;
  }

  private loadFromDisk(): PersistedDatabase {
    const candidatePaths =
      STORE_PATH === BUNDLED_STORE_PATH ? [STORE_PATH] : [STORE_PATH, BUNDLED_STORE_PATH];

    for (const filePath of candidatePaths) {
      try {
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(raw) as PersistedDatabase;
          if (parsed && parsed.settings && Array.isArray(parsed.doctors)) {
            return this.normalizeDb(parsed);
          }
        }
      } catch (err) {
        console.error(`Failed to read store from ${filePath}:`, err);
      }
    }

    const fresh = createInitialDatabase();
    this.saveSync(fresh);
    return fresh;
  }

  private saveSync(data: PersistedDatabase): void {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const tmpPath = `${STORE_PATH}.${crypto.randomBytes(4).toString('hex')}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, STORE_PATH);
    } catch (err) {
      console.warn('Local disk save skipped (using in-memory / Supabase state):', err);
    }
  }

  private async persist(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      this.saveSync(this.db);
      await this.pushToSupabase(this.db);
    });
    await this.writeQueue;
  }

  public getSnapshot(): PersistedDatabase {
    return this.db;
  }

  public getPublicPayload(): PublicSitePayload {
    const visibleDoctors = this.db.doctors
      .filter((d) => d.isActive && d.isVisible)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const visibleServices = this.db.services
      .filter((s) => s.isActive && s.isVisible)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const activeDepartments = this.db.departments
      .filter((d) => d.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const publishedGallery = this.db.gallery
      .filter((g) => g.isPublished)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const approvedReviews = this.db.reviews.filter((r) => r.isApproved && r.isVisible);

    // Never expose customer data, appointments, notifications, or audit logs publicly
    return {
      settings: this.db.settings,
      departments: activeDepartments,
      doctors: visibleDoctors,
      services: visibleServices,
      gallery: publishedGallery,
      reviews: approvedReviews,
      businessHours: this.db.businessHours,
      blockedDates: this.db.blockedDates,
      doctorSchedules: this.db.doctorSchedules,
    };
  }

  // ---- Password hashing (scrypt) ----
  public static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
  }

  public static verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [salt, keyHex] = parts;
    const derived = crypto.scryptSync(password, salt, 64);
    const keyBuf = Buffer.from(keyHex, 'hex');
    if (derived.length !== keyBuf.length) return false;
    return crypto.timingSafeEqual(derived, keyBuf);
  }

  public isAdminConfigured(): { configured: boolean; mode: 'env_passcode' | 'claimed_account' | 'needs_setup' } {
    const envPass = (process.env.ADMIN_PASSCODE || '').trim();
    if (envPass.length > 0) {
      return { configured: true, mode: 'env_passcode' };
    }
    if (this.db.adminAuth) {
      return { configured: true, mode: 'claimed_account' };
    }
    return { configured: false, mode: 'needs_setup' };
  }

  public async claimInitialAdmin(
    username: string,
    email: string,
    password: string,
    fullName?: string
  ): Promise<boolean> {
    await this.syncFromSupabase(true);
    const status = this.isAdminConfigured();
    if (status.configured) {
      return false;
    }
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const ts = nowIso();
    this.db.adminAuth = {
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: GoodHopeStore.hashPassword(password),
      claimedAt: ts,
      updatedAt: ts,
    };
    this.db.adminProfile = {
      ...this.db.adminProfile,
      username: cleanUsername,
      email: cleanEmail,
      fullName: fullName?.trim() || this.db.adminProfile.fullName,
      updatedAt: ts,
    };
    this.addAudit(
      cleanEmail,
      'CLAIM_ADMIN',
      'admin_users',
      'primary',
      `Admin account created (User ID: ${cleanUsername}, Email: ${cleanEmail})`
    );
    await this.persist();
    return true;
  }

  public async verifyAdminCredentials(identifier: string, password: string): Promise<boolean> {
    await this.syncFromSupabase(true);
    const envPass = (process.env.ADMIN_PASSCODE || '').trim();
    if (envPass.length > 0) {
      const a = Buffer.from(password);
      const b = Buffer.from(envPass);
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    }
    if (!this.db.adminAuth) return false;
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) return false;
    const emailMatches = cleanId === this.db.adminAuth.email.trim().toLowerCase();
    const usernameMatches =
      Boolean(this.db.adminAuth.username) &&
      cleanId === this.db.adminAuth.username.trim().toLowerCase();
    if (!emailMatches && !usernameMatches) return false;
    return GoodHopeStore.verifyPassword(password, this.db.adminAuth.passwordHash);
  }

  public async updateAdminCredentials(input: {
    currentPassword: string;
    newUsername?: string;
    newEmail?: string;
    newPassword?: string;
  }): Promise<{ ok: true; profile: AdminProfile } | { ok: false; error: string }> {
    await this.syncFromSupabase(true);
    const envPass = (process.env.ADMIN_PASSCODE || '').trim();
    if (envPass.length > 0) {
      return {
        ok: false,
        error:
          'Admin passcode is currently controlled by the ADMIN_PASSCODE environment secret. Clear ADMIN_PASSCODE in Secrets to manage User ID, Email & Password directly from the website.',
      };
    }
    if (!this.db.adminAuth) {
      return { ok: false, error: 'Admin account not initialized.' };
    }
    if (!GoodHopeStore.verifyPassword(input.currentPassword, this.db.adminAuth.passwordHash)) {
      return { ok: false, error: 'Current password is incorrect.' };
    }

    const ts = nowIso();
    const changes: string[] = [];

    if (input.newUsername && input.newUsername.trim()) {
      const cleanUsername = input.newUsername.trim().toLowerCase();
      if (cleanUsername !== this.db.adminAuth.username) {
        this.db.adminAuth.username = cleanUsername;
        this.db.adminProfile.username = cleanUsername;
        changes.push(`User ID -> ${cleanUsername}`);
      }
    }

    if (input.newEmail && input.newEmail.trim()) {
      const cleanEmail = input.newEmail.trim().toLowerCase();
      if (cleanEmail !== this.db.adminAuth.email) {
        this.db.adminAuth.email = cleanEmail;
        this.db.adminProfile.email = cleanEmail;
        changes.push(`Email -> ${cleanEmail}`);
      }
    }

    if (input.newPassword && input.newPassword.length >= 8) {
      this.db.adminAuth.passwordHash = GoodHopeStore.hashPassword(input.newPassword);
      changes.push('Password updated');
    }

    if (changes.length === 0) {
      return { ok: false, error: 'No changes detected. Update User ID, Email, or New Password.' };
    }

    this.db.adminAuth.updatedAt = ts;
    this.db.adminProfile.updatedAt = ts;
    this.addAudit(
      this.db.adminProfile.email || this.db.adminProfile.username,
      'UPDATE_CREDENTIALS',
      'admin_users',
      'primary',
      changes.join(' · ')
    );
    await this.persist();
    return { ok: true, profile: this.db.adminProfile };
  }

  public async changeAdminPassword(currentPassword: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
    const result = await this.updateAdminCredentials({
      currentPassword,
      newPassword,
    });
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true };
  }

  // ---- Audit helper ----
  public addAudit(actor: string, action: string, entityType: string, entityId: string, summary: string): void {
    this.db.auditLogs.unshift({
      id: crypto.randomUUID(),
      actor,
      action,
      entityType,
      entityId,
      summary,
      createdAt: nowIso(),
    });
    if (this.db.auditLogs.length > 200) {
      this.db.auditLogs = this.db.auditLogs.slice(0, 200);
    }
  }

  // ---- Time slot computation (Asia/Kolkata aware) ----
  private parseMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  private formatMinutes(total: number): string {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  public getAvailableSlots(doctorId: string, dateStr: string): {
    date: string;
    doctorId: string;
    isBlocked: boolean;
    blockedReason: string | null;
    scheduleConfigured: boolean;
    temporarilyUnavailable: boolean;
    unavailableReason: string;
    slots: Array<{ startTime: string; endTime: string; available: boolean; reason?: string }>;
  } {
    const schedule = this.db.doctorSchedules[doctorId];
    const doc = this.db.doctors.find((d) => d.id === doctorId);

    // Check full-day blocks (global or doctor-specific)
    const fullDayBlock = this.db.blockedDates.find(
      (b) =>
        b.date === dateStr &&
        (b.doctorId === null || b.doctorId === doctorId) &&
        !b.startTime
    );
    if (fullDayBlock) {
      return {
        date: dateStr,
        doctorId,
        isBlocked: true,
        blockedReason: fullDayBlock.reason || 'Clinic / Doctor unavailable on this date',
        scheduleConfigured: Boolean(schedule?.isConfigured),
        temporarilyUnavailable: Boolean(schedule?.temporarilyUnavailable),
        unavailableReason: schedule?.unavailableReason || '',
        slots: [],
      };
    }

    if (!schedule || !doc) {
      return {
        date: dateStr,
        doctorId,
        isBlocked: false,
        blockedReason: null,
        scheduleConfigured: false,
        temporarilyUnavailable: false,
        unavailableReason: '',
        slots: [],
      };
    }

    if (schedule.temporarilyUnavailable) {
      return {
        date: dateStr,
        doctorId,
        isBlocked: true,
        blockedReason: schedule.unavailableReason || 'Doctor is temporarily unavailable',
        scheduleConfigured: schedule.isConfigured,
        temporarilyUnavailable: true,
        unavailableReason: schedule.unavailableReason,
        slots: [],
      };
    }

    if (schedule.holidays.includes(dateStr)) {
      return {
        date: dateStr,
        doctorId,
        isBlocked: true,
        blockedReason: 'Doctor holiday on selected date',
        scheduleConfigured: schedule.isConfigured,
        temporarilyUnavailable: false,
        unavailableReason: '',
        slots: [],
      };
    }

    if (!schedule.isConfigured) {
      return {
        date: dateStr,
        doctorId,
        isBlocked: false,
        blockedReason: null,
        scheduleConfigured: false,
        temporarilyUnavailable: false,
        unavailableReason: '',
        slots: [],
      };
    }

    // Parse YYYY-MM-DD in UTC noon to get exact day of week without TZ shift
    const [yr, mo, dy] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(Date.UTC(yr, mo - 1, dy, 12, 0, 0)).getUTCDay();
    const dayRule = schedule.weeklyDays.find((d) => d.dayOfWeek === dayOfWeek);

    if (!dayRule || !dayRule.enabled || !dayRule.startTime || !dayRule.endTime) {
      return {
        date: dateStr,
        doctorId,
        isBlocked: false,
        blockedReason: null,
        scheduleConfigured: true,
        temporarilyUnavailable: false,
        unavailableReason: '',
        slots: [],
      };
    }

    const startMin = this.parseMinutes(dayRule.startTime);
    const endMin = this.parseMinutes(dayRule.endTime);
    const step = Math.max(5, dayRule.slotDurationMinutes || 15);
    const breakStartMin = dayRule.breakStart ? this.parseMinutes(dayRule.breakStart) : -1;
    const breakEndMin = dayRule.breakEnd ? this.parseMinutes(dayRule.breakEnd) : -1;

    const activeBookingsForDay = this.db.appointments.filter(
      (a) =>
        a.doctorId === doctorId &&
        a.appointmentDate === dateStr &&
        (a.status === 'pending' || a.status === 'confirmed')
    );

    const maxReached =
      dayRule.maxDailyBookings > 0 && activeBookingsForDay.length >= dayRule.maxDailyBookings;

    const slotBlocks = this.db.blockedDates.filter(
      (b) =>
        b.date === dateStr &&
        (b.doctorId === null || b.doctorId === doctorId) &&
        Boolean(b.startTime)
    );

    const slots: Array<{ startTime: string; endTime: string; available: boolean; reason?: string }> = [];

    for (let cursor = startMin; cursor + step <= endMin; cursor += step) {
      const slotEnd = cursor + step;
      if (
        breakStartMin >= 0 &&
        breakEndMin > breakStartMin &&
        cursor < breakEndMin &&
        slotEnd > breakStartMin
      ) {
        continue;
      }

      const startLabel = this.formatMinutes(cursor);
      const endLabel = this.formatMinutes(slotEnd);

      const isSlotBlocked = slotBlocks.some((b) => {
        if (!b.startTime) return false;
        const bStart = this.parseMinutes(b.startTime);
        const bEnd = b.endTime ? this.parseMinutes(b.endTime) : bStart + step;
        return cursor < bEnd && slotEnd > bStart;
      });

      const isBooked = activeBookingsForDay.some((a) => a.startTime === startLabel);

      if (maxReached) {
        slots.push({ startTime: startLabel, endTime: endLabel, available: false, reason: 'Daily limit reached' });
      } else if (isSlotBlocked) {
        slots.push({ startTime: startLabel, endTime: endLabel, available: false, reason: 'Blocked' });
      } else if (isBooked) {
        slots.push({ startTime: startLabel, endTime: endLabel, available: false, reason: 'Booked' });
      } else {
        slots.push({ startTime: startLabel, endTime: endLabel, available: true });
      }
    }

    return {
      date: dateStr,
      doctorId,
      isBlocked: false,
      blockedReason: null,
      scheduleConfigured: true,
      temporarilyUnavailable: false,
      unavailableReason: '',
      slots,
    };
  }

  // ---- Atomic appointment booking (prevents double booking) ----
  public async createAppointmentAtomic(input: {
    customerName: string;
    customerMobile: string;
    customerEmail?: string;
    departmentId: string;
    serviceId: string;
    doctorId: string;
    appointmentDate: string;
    startTime: string;
    endTime?: string;
    customerMessage?: string;
  }): Promise<{ ok: true; appointment: Appointment } | { ok: false; error: string; statusCode: number }> {
    if (!this.db.settings.visibility.allowPublicBooking) {
      return {
        ok: false,
        error: this.db.settings.bookingPausedMessage || 'Appointment booking is currently paused.',
        statusCode: 403,
      };
    }

    const dept = this.db.departments.find((d) => d.id === input.departmentId && d.isActive);
    const service = this.db.services.find((s) => s.id === input.serviceId && s.isActive);
    const doctor = this.db.doctors.find((d) => d.id === input.doctorId && d.isActive);

    if (!dept || !service || !doctor) {
      return { ok: false, error: 'Selected department, service, or doctor is no longer available.', statusCode: 400 };
    }

    const slotCheck = this.getAvailableSlots(doctor.id, input.appointmentDate);
    if (slotCheck.isBlocked) {
      return {
        ok: false,
        error: slotCheck.blockedReason || 'Selected date is blocked or unavailable.',
        statusCode: 409,
      };
    }

    const isEnquirySlot = input.startTime === 'Enquiry';

    if (slotCheck.scheduleConfigured) {
      if (isEnquirySlot) {
        return { ok: false, error: 'Please choose an available consultation time slot.', statusCode: 400 };
      }
      const matchedSlot = slotCheck.slots.find((s) => s.startTime === input.startTime);
      if (!matchedSlot || !matchedSlot.available) {
        return {
          ok: false,
          error: matchedSlot?.reason
            ? `This slot cannot be booked (${matchedSlot.reason}). Please choose another slot.`
            : 'Selected time slot is unavailable or already booked.',
          statusCode: 409,
        };
      }
    }

    // Duplicate check: same mobile + doctor + date + startTime while active
    const duplicate = this.db.appointments.find(
      (a) =>
        a.doctorId === doctor.id &&
        a.appointmentDate === input.appointmentDate &&
        a.startTime === input.startTime &&
        (a.status === 'pending' || a.status === 'confirmed') &&
        (a.startTime !== 'Enquiry' || a.customerMobile === input.customerMobile.trim())
    );
    if (duplicate) {
      return {
        ok: false,
        error: 'A booking already exists for this slot. Duplicate bookings are not permitted.',
        statusCode: 409,
      };
    }

    const ts = nowIso();
    const cleanMobile = input.customerMobile.trim();
    const cleanName = input.customerName.trim();
    const cleanEmail = (input.customerEmail || '').trim();

    let customer = this.db.customers.find((c) => c.mobile === cleanMobile);
    if (!customer) {
      customer = {
        id: crypto.randomUUID(),
        fullName: cleanName,
        mobile: cleanMobile,
        email: cleanEmail,
        notes: '',
        createdAt: ts,
        updatedAt: ts,
      };
      this.db.customers.unshift(customer);
    } else {
      customer.fullName = cleanName;
      if (cleanEmail) customer.email = cleanEmail;
      customer.updatedAt = ts;
    }

    // Generate unique booking reference in Asia/Kolkata date format
    const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const bookingReference = `GHP-${istDate}-${suffix}`;

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      bookingReference,
      customerId: customer.id,
      customerName: cleanName,
      customerMobile: cleanMobile,
      customerEmail: cleanEmail,
      departmentId: dept.id,
      departmentName: dept.name,
      serviceId: service.id,
      serviceName: service.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      appointmentDate: input.appointmentDate,
      startTime: input.startTime,
      endTime: input.endTime || (isEnquirySlot ? 'Pending confirmation' : input.startTime),
      status: 'pending',
      customerMessage: (input.customerMessage || '').trim(),
      adminNotes: '',
      createdAt: ts,
      updatedAt: ts,
    };

    this.db.appointments.unshift(appointment);

    this.db.notifications.unshift({
      id: crypto.randomUUID(),
      type: 'appointment_new',
      title: `New Booking Request (${bookingReference})`,
      message: `${cleanName} (${cleanMobile}) requested ${doctor.name} on ${input.appointmentDate} at ${input.startTime}.`,
      relatedId: appointment.id,
      isRead: false,
      createdAt: ts,
    });

    await this.persist();
    return { ok: true, appointment };
  }

  // ---- Generic mutation wrapper ----
  public async mutate<T>(fn: (db: PersistedDatabase) => T): Promise<T> {
    const result = fn(this.db);
    await this.persist();
    return result;
  }

  public async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
    actor: string,
    adminNotes?: string,
    reschedule?: { appointmentDate: string; startTime: string; endTime?: string }
  ): Promise<Appointment | null> {
    const appt = this.db.appointments.find((a) => a.id === id);
    if (!appt) return null;

    if (reschedule) {
      appt.appointmentDate = reschedule.appointmentDate;
      appt.startTime = reschedule.startTime;
      appt.endTime = reschedule.endTime || reschedule.startTime;
    }
    appt.status = status;
    if (typeof adminNotes === 'string') {
      appt.adminNotes = adminNotes;
    }
    appt.updatedAt = nowIso();

    this.db.notifications.unshift({
      id: crypto.randomUUID(),
      type: 'appointment_status',
      title: `Booking ${appt.bookingReference} marked ${status}`,
      message: `${appt.customerName} (${appt.doctorName}) updated to ${status}.`,
      relatedId: appt.id,
      isRead: true,
      createdAt: nowIso(),
    });

    this.addAudit(actor, 'UPDATE_APPOINTMENT', 'appointments', appt.id, `${appt.bookingReference} -> ${status}`);
    await this.persist();
    return appt;
  }
}

export const store = new GoodHopeStore();
