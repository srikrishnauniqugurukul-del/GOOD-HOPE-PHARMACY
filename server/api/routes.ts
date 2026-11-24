import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import express, { type Router } from 'express';
import multer from 'multer';
import { store, UPLOADS_DIR } from '../services/store.ts';
import {
  createSessionToken,
  rateLimit,
  requireAdminAuth,
  type AdminRequest,
} from '../middleware/auth.ts';
import {
  adminLoginSchema,
  adminSetupSchema,
  blockedDateSchema,
  bookingRequestSchema,
  contactEnquirySchema,
  departmentUpsertSchema,
  doctorUpsertSchema,
  galleryUpsertSchema,
  isSafeUrl,
  reviewUpsertSchema,
  serviceUpsertSchema,
} from '../validation/schemas.ts';
import type { AppointmentStatus, BusinessHourRow, DayAvailability, SiteSettings } from '../../src/types/domain.ts';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || crypto.randomBytes(3).toString('hex');
}

const ALLOWED_IMAGE_MIME = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      cb(null, UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = ALLOWED_IMAGE_MIME.get(file.mimetype) || '.jpg';
      const safeName = `ghp-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      cb(null, safeName);
    },
  }),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, or GIF image uploads are permitted.'));
    }
  },
});

export function createApiRouter(): Router {
  const router = express.Router();

  // =========================================================================
  // SAFE UPLOADED FILE SERVING (strict path confinement)
  // =========================================================================
  router.get('/uploads/:filename', (req, res) => {
    const rawName = path.basename(req.params.filename || '');
    if (!rawName || !/^[a-zA-Z0-9._-]+$/.test(rawName)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    const resolved = path.resolve(UPLOADS_DIR, rawName);
    if (!resolved.startsWith(UPLOADS_DIR + path.sep)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!fs.existsSync(resolved)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(resolved);
  });

  // =========================================================================
  // PUBLIC ROUTES (Strictly public catalog only — zero private customer PII)
  // =========================================================================
  router.get('/public/site', (_req, res) => {
    res.json(store.getPublicPayload());
  });

  router.get('/public/slots', (req, res) => {
    const doctorId = String(req.query.doctorId || '').trim();
    const date = String(req.query.date || '').trim();
    if (!doctorId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Valid doctorId and date (YYYY-MM-DD) are required.' });
    }
    return res.json(store.getAvailableSlots(doctorId, date));
  });

  router.post('/public/appointments', rateLimit(20, 60_000), async (req, res) => {
    const parsed = bookingRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Please check the booking details.',
      });
    }
    const result = await store.createAppointmentAtomic(parsed.data);
    if (!result.ok) {
      return res.status(result.statusCode).json({ error: result.error });
    }
    // Return only the caller's own confirmation receipt
    return res.status(201).json({
      bookingReference: result.appointment.bookingReference,
      status: result.appointment.status,
      doctorName: result.appointment.doctorName,
      departmentName: result.appointment.departmentName,
      serviceName: result.appointment.serviceName,
      appointmentDate: result.appointment.appointmentDate,
      startTime: result.appointment.startTime,
      endTime: result.appointment.endTime,
      createdAt: result.appointment.createdAt,
    });
  });

  router.post('/public/contact', rateLimit(12, 60_000), async (req, res) => {
    const parsed = contactEnquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Please complete all required fields.',
      });
    }
    const ts = new Date().toISOString();
    const enquiryId = crypto.randomUUID();
    await store.mutate((db) => {
      db.contactEnquiries.unshift({
        id: enquiryId,
        fullName: parsed.data.fullName,
        mobile: parsed.data.mobile,
        email: parsed.data.email || '',
        subject: parsed.data.subject || 'General Enquiry',
        message: parsed.data.message,
        isResolved: false,
        createdAt: ts,
      });
      db.notifications.unshift({
        id: crypto.randomUUID(),
        type: 'contact_enquiry',
        title: `Contact Enquiry from ${parsed.data.fullName}`,
        message: `${parsed.data.mobile}: ${parsed.data.message.slice(0, 140)}`,
        relatedId: enquiryId,
        isRead: false,
        createdAt: ts,
      });
    });
    return res.status(201).json({ ok: true, id: enquiryId });
  });

  // =========================================================================
  // ADMIN AUTHENTICATION ROUTES
  // =========================================================================
  router.get('/admin/auth/status', (_req, res) => {
    const status = store.isAdminConfigured();
    res.json({
      ...status,
      storageBackend: store.getStorageBackendMode(),
    });
  });

  router.post('/admin/auth/setup', rateLimit(10, 60_000), async (req, res) => {
    const parsed = adminSetupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Please enter a valid email and strong password (8+ chars).',
      });
    }
    const claimed = await store.claimInitialAdmin(
      parsed.data.email,
      parsed.data.password,
      parsed.data.fullName
    );
    if (!claimed) {
      return res.status(409).json({
        error: 'Admin account is already configured. Please sign in instead.',
      });
    }
    const snapshot = store.getSnapshot();
    const token = createSessionToken(snapshot.adminProfile.email, snapshot.adminProfile.role);
    return res.status(201).json({
      token,
      profile: snapshot.adminProfile,
    });
  });

  router.post('/admin/auth/login', rateLimit(15, 60_000), (req, res) => {
    const status = store.isAdminConfigured();
    if (!status.configured) {
      return res.status(403).json({
        error: 'Admin account has not been claimed yet. Complete first-run setup first.',
      });
    }
    const parsed = adminLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Please provide your credentials.' });
    }
    const valid = store.verifyAdminCredentials(parsed.data.email, parsed.data.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }
    const snapshot = store.getSnapshot();
    const token = createSessionToken(snapshot.adminProfile.email, snapshot.adminProfile.role);
    return res.json({
      token,
      profile: snapshot.adminProfile,
    });
  });

  // =========================================================================
  // PROTECTED ADMIN ROUTES (require valid signed Bearer token)
  // =========================================================================
  router.use('/admin', requireAdminAuth);

  router.post('/admin/auth/change-password', async (req: AdminRequest, res) => {
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }
    const result = await store.changeAdminPassword(currentPassword, newPassword);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({ ok: true });
  });

  router.get('/admin/overview', (_req: AdminRequest, res) => {
    const db = store.getSnapshot();
    const todayIst = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const stats = {
      totalBookings: db.appointments.length,
      todayBookings: db.appointments.filter((a) => a.appointmentDate === todayIst).length,
      pendingAppointments: db.appointments.filter((a) => a.status === 'pending').length,
      confirmedAppointments: db.appointments.filter((a) => a.status === 'confirmed').length,
      cancelledAppointments: db.appointments.filter((a) => a.status === 'cancelled').length,
      completedAppointments: db.appointments.filter((a) => a.status === 'completed').length,
      noShowAppointments: db.appointments.filter((a) => a.status === 'no-show').length,
      totalCustomers: db.customers.length,
      activeDoctors: db.doctors.filter((d) => d.isActive && d.isVisible).length,
      verifiedDoctors: db.doctors.filter((d) => d.verificationStatus === 'verified').length,
      activeServices: db.services.filter((s) => s.isActive && s.isVisible).length,
      unreadNotifications: db.notifications.filter((n) => !n.isRead).length,
    };

    res.json({
      storageBackend: store.getStorageBackendMode(),
      authMode: store.isAdminConfigured().mode,
      stats,
      adminProfile: db.adminProfile,
      settings: db.settings,
      departments: db.departments,
      doctors: db.doctors,
      services: db.services,
      doctorSchedules: db.doctorSchedules,
      businessHours: db.businessHours,
      blockedDates: db.blockedDates,
      customers: db.customers,
      appointments: db.appointments,
      gallery: db.gallery,
      reviews: db.reviews,
      notifications: db.notifications,
      contactEnquiries: db.contactEnquiries,
      auditLogs: db.auditLogs,
    });
  });

  // ---- Image Upload (stored on server disk so every browser/Chrome sees it live) ----
  router.post('/admin/upload', (req: AdminRequest, res) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Image upload failed.' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided.' });
      }
      const imageUrl = `/api/uploads/${req.file.filename}`;
      return res.status(201).json({ imageUrl, filename: req.file.filename });
    });
  });

  // ---- Doctors CRUD ----
  router.post('/admin/doctors', async (req: AdminRequest, res) => {
    const parsed = doctorUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid doctor data.' });
    }
    const ts = new Date().toISOString();
    const created = await store.mutate((db) => {
      const dept = db.departments.find((d) => d.id === parsed.data.departmentId);
      const id = `doc-${crypto.randomBytes(4).toString('hex')}`;
      const doc = {
        id,
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        departmentId: parsed.data.departmentId,
        departmentName: dept?.name || parsed.data.speciality,
        speciality: parsed.data.speciality,
        qualifications: parsed.data.qualifications,
        boardDescription: parsed.data.boardDescription,
        registrationNumber: parsed.data.registrationNumber,
        affiliation: parsed.data.affiliation,
        bio: parsed.data.bio,
        photoUrl: parsed.data.photoUrl ?? null,
        verificationStatus: parsed.data.verificationStatus,
        verificationNote: parsed.data.verificationNote,
        isVisible: parsed.data.isVisible,
        isActive: parsed.data.isActive,
        scheduleConfigured: false,
        consultationFeeNote: parsed.data.consultationFeeNote,
        displayOrder: parsed.data.displayOrder ?? db.doctors.length + 1,
        createdAt: ts,
        updatedAt: ts,
      };
      db.doctors.push(doc);
      db.doctorSchedules[id] = {
        doctorId: id,
        isConfigured: false,
        temporarilyUnavailable: false,
        unavailableReason: '',
        holidays: [],
        weeklyDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
          (dayName, dayOfWeek) => ({
            dayOfWeek,
            dayName,
            enabled: false,
            startTime: '10:00',
            endTime: '13:00',
            breakStart: '',
            breakEnd: '',
            slotDurationMinutes: 15,
            maxDailyBookings: 20,
          })
        ),
        updatedAt: ts,
      };
      store.addAudit(req.admin?.email || 'Admin', 'CREATE_DOCTOR', 'doctors', id, `Added doctor ${doc.name}`);
      return doc;
    });
    return res.status(201).json(created);
  });

  router.put('/admin/doctors/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const parsed = doctorUpsertSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid doctor update.' });
    }
    const updated = await store.mutate((db) => {
      const idx = db.doctors.findIndex((d) => d.id === id);
      if (idx === -1) return null;
      const existing = db.doctors[idx];
      const nextDeptId = parsed.data.departmentId ?? existing.departmentId;
      const dept = db.departments.find((d) => d.id === nextDeptId);
      const next = {
        ...existing,
        ...parsed.data,
        departmentName: dept?.name || existing.departmentName,
        updatedAt: new Date().toISOString(),
      };
      db.doctors[idx] = next;
      store.addAudit(req.admin?.email || 'Admin', 'UPDATE_DOCTOR', 'doctors', id, `Updated ${next.name}`);
      return next;
    });
    if (!updated) return res.status(404).json({ error: 'Doctor not found.' });
    return res.json(updated);
  });

  router.delete('/admin/doctors/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const deleted = await store.mutate((db) => {
      const idx = db.doctors.findIndex((d) => d.id === id);
      if (idx === -1) return null;
      const [removed] = db.doctors.splice(idx, 1);
      delete db.doctorSchedules[id];
      store.addAudit(req.admin?.email || 'Admin', 'DELETE_DOCTOR', 'doctors', id, `Removed doctor ${removed.name}`);
      return removed;
    });
    if (!deleted) return res.status(404).json({ error: 'Doctor not found.' });
    return res.json({ ok: true });
  });

  // ---- Departments CRUD ----
  router.post('/admin/departments', async (req: AdminRequest, res) => {
    const parsed = departmentUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid department.' });
    }
    const ts = new Date().toISOString();
    const created = await store.mutate((db) => {
      const id = `dept-${crypto.randomBytes(4).toString('hex')}`;
      const dept = {
        id,
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        description: parsed.data.description,
        icon: parsed.data.icon,
        isActive: parsed.data.isActive,
        displayOrder: parsed.data.displayOrder ?? db.departments.length + 1,
        createdAt: ts,
        updatedAt: ts,
      };
      db.departments.push(dept);
      store.addAudit(req.admin?.email || 'Admin', 'CREATE_DEPARTMENT', 'departments', id, `Added department ${dept.name}`);
      return dept;
    });
    return res.status(201).json(created);
  });

  router.put('/admin/departments/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const parsed = departmentUpsertSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid department update.' });
    }
    const updated = await store.mutate((db) => {
      const idx = db.departments.findIndex((d) => d.id === id);
      if (idx === -1) return null;
      db.departments[idx] = {
        ...db.departments[idx],
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      };
      // Sync doctor department names
      db.doctors.forEach((doc) => {
        if (doc.departmentId === id) doc.departmentName = db.departments[idx].name;
      });
      store.addAudit(req.admin?.email || 'Admin', 'UPDATE_DEPARTMENT', 'departments', id, `Updated ${db.departments[idx].name}`);
      return db.departments[idx];
    });
    if (!updated) return res.status(404).json({ error: 'Department not found.' });
    return res.json(updated);
  });

  router.delete('/admin/departments/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const deleted = await store.mutate((db) => {
      const idx = db.departments.findIndex((d) => d.id === id);
      if (idx === -1) return null;
      const [removed] = db.departments.splice(idx, 1);
      store.addAudit(req.admin?.email || 'Admin', 'DELETE_DEPARTMENT', 'departments', id, `Removed ${removed.name}`);
      return removed;
    });
    if (!deleted) return res.status(404).json({ error: 'Department not found.' });
    return res.json({ ok: true });
  });

  // ---- Services CRUD ----
  router.post('/admin/services', async (req: AdminRequest, res) => {
    const parsed = serviceUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid service.' });
    }
    const ts = new Date().toISOString();
    const created = await store.mutate((db) => {
      const id = `srv-${crypto.randomBytes(4).toString('hex')}`;
      const srv = {
        id,
        ...parsed.data,
        displayOrder: parsed.data.displayOrder ?? db.services.length + 1,
        createdAt: ts,
        updatedAt: ts,
      };
      db.services.push(srv);
      store.addAudit(req.admin?.email || 'Admin', 'CREATE_SERVICE', 'services', id, `Added service ${srv.name}`);
      return srv;
    });
    return res.status(201).json(created);
  });

  router.put('/admin/services/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const parsed = serviceUpsertSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid service update.' });
    }
    const updated = await store.mutate((db) => {
      const idx = db.services.findIndex((s) => s.id === id);
      if (idx === -1) return null;
      db.services[idx] = {
        ...db.services[idx],
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      };
      store.addAudit(req.admin?.email || 'Admin', 'UPDATE_SERVICE', 'services', id, `Updated service ${db.services[idx].name}`);
      return db.services[idx];
    });
    if (!updated) return res.status(404).json({ error: 'Service not found.' });
    return res.json(updated);
  });

  router.delete('/admin/services/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const deleted = await store.mutate((db) => {
      const idx = db.services.findIndex((s) => s.id === id);
      if (idx === -1) return null;
      const [removed] = db.services.splice(idx, 1);
      store.addAudit(req.admin?.email || 'Admin', 'DELETE_SERVICE', 'services', id, `Removed service ${removed.name}`);
      return removed;
    });
    if (!deleted) return res.status(404).json({ error: 'Service not found.' });
    return res.json({ ok: true });
  });

  // ---- Appointments Management ----
  router.patch('/admin/appointments/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const status = req.body?.status as AppointmentStatus;
    const allowed: AppointmentStatus[] = ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status.' });
    }
    const reschedule =
      req.body?.appointmentDate && req.body?.startTime
        ? {
            appointmentDate: String(req.body.appointmentDate),
            startTime: String(req.body.startTime),
            endTime: req.body.endTime ? String(req.body.endTime) : undefined,
          }
        : undefined;

    const updated = await store.updateAppointmentStatus(
      id,
      status,
      req.admin?.email || 'Admin',
      typeof req.body?.adminNotes === 'string' ? req.body.adminNotes : undefined,
      reschedule
    );
    if (!updated) return res.status(404).json({ error: 'Appointment not found.' });
    return res.json(updated);
  });

  router.delete('/admin/appointments/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const deleted = await store.mutate((db) => {
      const idx = db.appointments.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      const [removed] = db.appointments.splice(idx, 1);
      store.addAudit(req.admin?.email || 'Admin', 'DELETE_APPOINTMENT', 'appointments', id, `Deleted ${removed.bookingReference}`);
      return removed;
    });
    if (!deleted) return res.status(404).json({ error: 'Appointment not found.' });
    return res.json({ ok: true });
  });

  // ---- Customers ----
  router.put('/admin/customers/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const updated = await store.mutate((db) => {
      const customer = db.customers.find((c) => c.id === id);
      if (!customer) return null;
      if (typeof req.body?.fullName === 'string' && req.body.fullName.trim()) {
        customer.fullName = req.body.fullName.trim().slice(0, 120);
      }
      if (typeof req.body?.email === 'string') {
        customer.email = req.body.email.trim().slice(0, 140);
      }
      if (typeof req.body?.notes === 'string') {
        customer.notes = req.body.notes.trim().slice(0, 500);
      }
      customer.updatedAt = new Date().toISOString();
      store.addAudit(req.admin?.email || 'Admin', 'UPDATE_CUSTOMER', 'customers', id, `Updated customer ${customer.fullName}`);
      return customer;
    });
    if (!updated) return res.status(404).json({ error: 'Customer not found.' });
    return res.json(updated);
  });

  // ---- Doctor Schedules ----
  router.put('/admin/schedules/:doctorId', async (req: AdminRequest, res) => {
    const doctorId = req.params.doctorId;
    const weeklyDays = req.body?.weeklyDays as DayAvailability[] | undefined;
    if (!Array.isArray(weeklyDays) || weeklyDays.length !== 7) {
      return res.status(400).json({ error: 'Weekly schedule must contain all 7 days.' });
    }
    const updated = await store.mutate((db) => {
      const doc = db.doctors.find((d) => d.id === doctorId);
      if (!doc) return null;
      const isConfigured = Boolean(req.body?.isConfigured) || weeklyDays.some((d) => d.enabled);
      const next = {
        doctorId,
        isConfigured,
        temporarilyUnavailable: Boolean(req.body?.temporarilyUnavailable),
        unavailableReason: String(req.body?.unavailableReason || '').slice(0, 240),
        holidays: Array.isArray(req.body?.holidays)
          ? req.body.holidays.filter((h: unknown) => typeof h === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(h))
          : [],
        weeklyDays,
        updatedAt: new Date().toISOString(),
      };
      db.doctorSchedules[doctorId] = next;
      doc.scheduleConfigured = isConfigured;
      doc.updatedAt = next.updatedAt;
      store.addAudit(req.admin?.email || 'Admin', 'UPDATE_SCHEDULE', 'doctor_availability', doctorId, `Updated schedule for ${doc.name}`);
      return next;
    });
    if (!updated) return res.status(404).json({ error: 'Doctor not found.' });
    return res.json(updated);
  });

  // ---- Business Hours ----
  router.put('/admin/business-hours', async (req: AdminRequest, res) => {
    const hours = req.body?.businessHours as BusinessHourRow[] | undefined;
    if (!Array.isArray(hours)) {
      return res.status(400).json({ error: 'businessHours array is required.' });
    }
    await store.mutate((db) => {
      db.businessHours = hours;
      store.addAudit(req.admin?.email || 'Admin', 'UPDATE_HOURS', 'business_hours', 'all', 'Updated pharmacy / consultation / booking hours');
    });
    return res.json({ ok: true });
  });

  // ---- Blocked Dates ----
  router.post('/admin/blocked-dates', async (req: AdminRequest, res) => {
    const parsed = blockedDateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid blocked date.' });
    }
    const created = await store.mutate((db) => {
      const item = {
        id: crypto.randomUUID(),
        ...parsed.data,
        createdAt: new Date().toISOString(),
      };
      db.blockedDates.unshift(item);
      store.addAudit(req.admin?.email || 'Admin', 'BLOCK_DATE', 'blocked_dates', item.id, `Blocked ${item.date}: ${item.reason}`);
      return item;
    });
    return res.status(201).json(created);
  });

  router.delete('/admin/blocked-dates/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const removed = await store.mutate((db) => {
      const idx = db.blockedDates.findIndex((b) => b.id === id);
      if (idx === -1) return null;
      const [item] = db.blockedDates.splice(idx, 1);
      store.addAudit(req.admin?.email || 'Admin', 'UNBLOCK_DATE', 'blocked_dates', id, `Restored availability for ${item.date}`);
      return item;
    });
    if (!removed) return res.status(404).json({ error: 'Blocked date not found.' });
    return res.json({ ok: true });
  });

  // ---- Gallery Management (Add, Edit, Show/Hide, Reorder, Permanent Delete) ----
  router.post('/admin/gallery', async (req: AdminRequest, res) => {
    const parsed = galleryUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid gallery item.' });
    }
    const ts = new Date().toISOString();
    const created = await store.mutate((db) => {
      const item = {
        id: `gal-${crypto.randomBytes(4).toString('hex')}`,
        ...parsed.data,
        displayOrder: parsed.data.displayOrder ?? db.gallery.length + 1,
        uploadedByAdmin: true,
        createdAt: ts,
        updatedAt: ts,
      };
      db.gallery.push(item);
      store.addAudit(req.admin?.email || 'Admin', 'ADD_PHOTO', 'gallery', item.id, `Added photo "${item.title}"`);
      return item;
    });
    return res.status(201).json(created);
  });

  router.put('/admin/gallery/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const parsed = galleryUpsertSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid gallery update.' });
    }
    const updated = await store.mutate((db) => {
      const idx = db.gallery.findIndex((g) => g.id === id);
      if (idx === -1) return null;
      db.gallery[idx] = {
        ...db.gallery[idx],
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      };
      store.addAudit(
        req.admin?.email || 'Admin',
        'UPDATE_PHOTO',
        'gallery',
        id,
        `Updated photo "${db.gallery[idx].title}" (published: ${db.gallery[idx].isPublished})`
      );
      return db.gallery[idx];
    });
    if (!updated) return res.status(404).json({ error: 'Gallery item not found.' });
    return res.json(updated);
  });

  router.post('/admin/gallery/reorder', async (req: AdminRequest, res) => {
    const orderedIds = req.body?.orderedIds as string[] | undefined;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array required.' });
    }
    await store.mutate((db) => {
      orderedIds.forEach((id, index) => {
        const item = db.gallery.find((g) => g.id === id);
        if (item) item.displayOrder = index + 1;
      });
      db.gallery.sort((a, b) => a.displayOrder - b.displayOrder);
      store.addAudit(req.admin?.email || 'Admin', 'REORDER_GALLERY', 'gallery', 'all', 'Reordered gallery photos');
    });
    return res.json({ ok: true });
  });

  router.delete('/admin/gallery/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const removed = await store.mutate((db) => {
      const idx = db.gallery.findIndex((g) => g.id === id);
      if (idx === -1) return null;
      const [item] = db.gallery.splice(idx, 1);
      store.addAudit(req.admin?.email || 'Admin', 'DELETE_PHOTO', 'gallery', id, `Deleted photo "${item.title}"`);
      return item;
    });
    if (!removed) return res.status(404).json({ error: 'Photo not found.' });

    // Clean up local uploaded file if stored in UPLOADS_DIR
    if (removed.imageUrl.startsWith('/api/uploads/')) {
      const fileName = path.basename(removed.imageUrl);
      const resolved = path.resolve(UPLOADS_DIR, fileName);
      if (resolved.startsWith(UPLOADS_DIR + path.sep) && fs.existsSync(resolved)) {
        try {
          fs.unlinkSync(resolved);
        } catch {
          // Non-fatal cleanup error
        }
      }
    }
    return res.json({ ok: true });
  });

  // ---- Reviews ----
  router.post('/admin/reviews', async (req: AdminRequest, res) => {
    const parsed = reviewUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid review.' });
    }
    const created = await store.mutate((db) => {
      const item = {
        id: crypto.randomUUID(),
        ...parsed.data,
        createdAt: new Date().toISOString(),
      };
      db.reviews.unshift(item);
      store.addAudit(req.admin?.email || 'Admin', 'ADD_REVIEW', 'reviews', item.id, `Added review by ${item.customerName}`);
      return item;
    });
    return res.status(201).json(created);
  });

  router.put('/admin/reviews/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const parsed = reviewUpsertSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid review update.' });
    }
    const updated = await store.mutate((db) => {
      const idx = db.reviews.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      db.reviews[idx] = { ...db.reviews[idx], ...parsed.data };
      store.addAudit(req.admin?.email || 'Admin', 'UPDATE_REVIEW', 'reviews', id, `Updated review visibility/approval`);
      return db.reviews[idx];
    });
    if (!updated) return res.status(404).json({ error: 'Review not found.' });
    return res.json(updated);
  });

  router.delete('/admin/reviews/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    const removed = await store.mutate((db) => {
      const idx = db.reviews.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      const [item] = db.reviews.splice(idx, 1);
      store.addAudit(req.admin?.email || 'Admin', 'DELETE_REVIEW', 'reviews', id, `Deleted review by ${item.customerName}`);
      return item;
    });
    if (!removed) return res.status(404).json({ error: 'Review not found.' });
    return res.json({ ok: true });
  });

  // ---- Notifications & Contact Enquiries ----
  router.patch('/admin/notifications/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    await store.mutate((db) => {
      const item = db.notifications.find((n) => n.id === id);
      if (item) item.isRead = Boolean(req.body?.isRead ?? true);
    });
    return res.json({ ok: true });
  });

  router.post('/admin/notifications/read-all', async (_req: AdminRequest, res) => {
    await store.mutate((db) => {
      db.notifications.forEach((n) => {
        n.isRead = true;
      });
    });
    return res.json({ ok: true });
  });

  router.patch('/admin/enquiries/:id', async (req: AdminRequest, res) => {
    const id = req.params.id;
    await store.mutate((db) => {
      const item = db.contactEnquiries.find((e) => e.id === id);
      if (item) item.isResolved = Boolean(req.body?.isResolved ?? true);
    });
    return res.json({ ok: true });
  });

  // ---- Site Settings & Visibility Controls (Show/Hide Everything!) ----
  router.put('/admin/settings', async (req: AdminRequest, res) => {
    const body = req.body as Partial<SiteSettings>;
    const urlFields: Array<keyof SiteSettings> = [
      'googleMapsUrl',
      'facebookUrl',
      'googleReviewUrl',
      'logoUrl',
      'ownerPhotoUrl',
    ];
    for (const field of urlFields) {
      const val = body[field];
      if (typeof val === 'string' && val.trim() !== '' && !isSafeUrl(val)) {
        return res.status(400).json({ error: `Invalid URL provided for ${field}. Use http(s) or local upload path.` });
      }
    }

    const updated = await store.mutate((db) => {
      db.settings = {
        ...db.settings,
        ...body,
        visibility: {
          ...db.settings.visibility,
          ...(body.visibility || {}),
        },
        updatedAt: new Date().toISOString(),
      };
      store.addAudit(req.admin?.email || 'Admin', 'UPDATE_SETTINGS', 'site_settings', 'default', 'Updated website content, map/contact settings, or visibility toggles');
      return db.settings;
    });
    return res.json(updated);
  });

  // ---- Admin Profile ----
  router.put('/admin/profile', async (req: AdminRequest, res) => {
    const updated = await store.mutate((db) => {
      db.adminProfile = {
        ...db.adminProfile,
        fullName: typeof req.body?.fullName === 'string' ? req.body.fullName.trim().slice(0, 120) : db.adminProfile.fullName,
        phone: typeof req.body?.phone === 'string' ? req.body.phone.trim().slice(0, 30) : db.adminProfile.phone,
        role: typeof req.body?.role === 'string' ? req.body.role.trim().slice(0, 80) : db.adminProfile.role,
        updatedAt: new Date().toISOString(),
      };
      store.addAudit(req.admin?.email || 'Admin', 'UPDATE_PROFILE', 'admin_users', 'primary', 'Updated admin profile details');
      return db.adminProfile;
    });
    return res.json(updated);
  });

  return router;
}
