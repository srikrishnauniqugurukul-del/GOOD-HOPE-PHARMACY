import { z } from 'zod';

export function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/')) return !trimmed.startsWith('//');
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const safeUrlSchema = z
  .string()
  .max(1000)
  .refine(isSafeUrl, { message: 'Only http(s) URLs or local relative paths are allowed.' });

export const bookingRequestSchema = z.object({
  customerName: z.string().trim().min(2, 'Please enter your full name.').max(120),
  customerMobile: z
    .string()
    .trim()
    .min(7, 'Please enter a valid mobile number.')
    .max(24)
    .regex(/^[0-9+\-\s()]+$/, 'Mobile number contains invalid characters.'),
  customerEmail: z.string().trim().email('Please enter a valid email address.').or(z.literal('')).optional(),
  departmentId: z.string().min(1, 'Please select a department.'),
  serviceId: z.string().min(1, 'Please select a service.'),
  doctorId: z.string().min(1, 'Please select a doctor.'),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please select a valid date (YYYY-MM-DD).'),
  startTime: z.string().trim().min(1, 'Please select a time slot.').max(30),
  endTime: z.string().trim().max(30).optional(),
  customerMessage: z.string().trim().max(500).optional(),
});

export const contactEnquirySchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your name.').max(120),
  mobile: z
    .string()
    .trim()
    .min(7, 'Please enter a valid phone number.')
    .max(24)
    .regex(/^[0-9+\-\s()]+$/, 'Phone number contains invalid characters.'),
  email: z.string().trim().email('Invalid email address.').or(z.literal('')).optional(),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(5, 'Please enter a short message.').max(1200),
});

export const adminSetupSchema = z.object({
  email: z.string().trim().email('Please enter a valid admin email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
  fullName: z.string().trim().min(2).max(120).optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().max(160).optional().default(''),
  password: z.string().min(1, 'Password is required.').max(128),
});

export const doctorUpsertSchema = z.object({
  name: z.string().trim().min(2).max(140),
  departmentId: z.string().min(1),
  speciality: z.string().trim().min(2).max(160),
  qualifications: z.string().trim().max(300).optional().default(''),
  boardDescription: z.string().trim().max(500).optional().default(''),
  registrationNumber: z.string().trim().max(80).optional().default(''),
  affiliation: z.string().trim().max(200).optional().default(''),
  bio: z.string().trim().max(1200).optional().default(''),
  photoUrl: safeUrlSchema.nullable().optional(),
  verificationStatus: z.enum(['draft_unverified', 'verified']).optional().default('draft_unverified'),
  verificationNote: z.string().trim().max(400).optional().default(''),
  isVisible: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  consultationFeeNote: z.string().trim().max(120).optional().default('Confirm at counter'),
  displayOrder: z.number().int().min(0).max(999).optional(),
});

export const departmentUpsertSchema = z.object({
  name: z.string().trim().min(2).max(140),
  description: z.string().trim().max(500).optional().default(''),
  icon: z.string().trim().max(40).optional().default('stethoscope'),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.number().int().min(0).max(999).optional(),
});

export const serviceUpsertSchema = z.object({
  name: z.string().trim().min(2).max(180),
  departmentId: z.string().min(1),
  category: z.string().trim().min(2).max(160),
  description: z.string().trim().max(600).optional().default(''),
  doctorId: z.string().nullable().optional().default(null),
  durationMinutes: z.number().int().min(5).max(180).optional().default(20),
  consultationFee: z.number().min(0).max(100000).nullable().optional().default(null),
  feeLabel: z.string().trim().max(100).optional().default('Confirm at pharmacy desk'),
  availabilityNote: z.string().trim().max(200).optional().default('By prior appointment'),
  isActive: z.boolean().optional().default(true),
  isVisible: z.boolean().optional().default(true),
  icon: z.string().trim().max(40).optional().default('stethoscope'),
  imageUrl: safeUrlSchema.nullable().optional().default(null),
  displayOrder: z.number().int().min(0).max(999).optional(),
});

export const galleryUpsertSchema = z.object({
  title: z.string().trim().min(2).max(160),
  caption: z.string().trim().max(400).optional().default(''),
  category: z.enum([
    'pharmacy_exterior',
    'pharmacy_signboard',
    'good_hope_logo',
    'doctor_board',
    'healthcare_environment',
  ]),
  imageUrl: safeUrlSchema.min(1, 'Image URL is required.'),
  isPublished: z.boolean().optional().default(true),
  displayOrder: z.number().int().min(0).max(999).optional(),
});

export const reviewUpsertSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(800),
  visitContext: z.string().trim().max(140).optional().default(''),
  sourceLabel: z.string().trim().max(80).optional().default('Verified Visitor'),
  isApproved: z.boolean().optional().default(false),
  isVisible: z.boolean().optional().default(false),
});

export const blockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  doctorId: z.string().nullable().optional().default(null),
  startTime: z.string().nullable().optional().default(null),
  endTime: z.string().nullable().optional().default(null),
  reason: z.string().trim().min(2).max(200),
  isHoliday: z.boolean().optional().default(true),
});
