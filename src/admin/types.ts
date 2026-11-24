import type {
  AdminProfile,
  Appointment,
  AuditLog,
  BlockedDate,
  BusinessHourRow,
  ContactEnquiry,
  Customer,
  Department,
  Doctor,
  DoctorSchedule,
  GalleryItem,
  NotificationItem,
  ReviewItem,
  ServiceItem,
  SiteSettings,
} from '../types/domain';

export interface AdminOverviewData {
  storageBackend: 'supabase' | 'local_server_db';
  authMode: 'env_passcode' | 'claimed_account' | 'needs_setup';
  stats: {
    totalBookings: number;
    todayBookings: number;
    pendingAppointments: number;
    confirmedAppointments: number;
    cancelledAppointments: number;
    completedAppointments: number;
    noShowAppointments: number;
    totalCustomers: number;
    activeDoctors: number;
    verifiedDoctors: number;
    activeServices: number;
    unreadNotifications: number;
  };
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

export type AdminTabKey =
  | 'overview'
  | 'appointments'
  | 'calendar'
  | 'doctors'
  | 'departments'
  | 'services'
  | 'customers'
  | 'business_hours'
  | 'doctor_availability'
  | 'blocked_dates'
  | 'gallery'
  | 'content'
  | 'notifications'
  | 'reviews'
  | 'map_contact'
  | 'profile'
  | 'security';

export interface AdminTabProps {
  overview: AdminOverviewData;
  token: string;
  onRefresh: () => Promise<void>;
  notify: (msg: string, isError?: boolean) => void;
}
