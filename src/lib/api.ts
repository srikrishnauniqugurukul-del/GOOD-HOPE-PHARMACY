import type { PublicSitePayload } from '../types/domain';

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function fetchPublicSite(): Promise<PublicSitePayload> {
  const res = await fetch('/api/public/site', { cache: 'no-store' });
  return parseJsonOrThrow<PublicSitePayload>(res);
}

export interface SlotAvailabilityResponse {
  date: string;
  doctorId: string;
  isBlocked: boolean;
  blockedReason: string | null;
  scheduleConfigured: boolean;
  temporarilyUnavailable: boolean;
  unavailableReason: string;
  slots: Array<{ startTime: string; endTime: string; available: boolean; reason?: string }>;
}

export async function fetchDoctorSlots(
  doctorId: string,
  date: string
): Promise<SlotAvailabilityResponse> {
  const params = new URLSearchParams({ doctorId, date });
  const res = await fetch(`/api/public/slots?${params.toString()}`, { cache: 'no-store' });
  return parseJsonOrThrow<SlotAvailabilityResponse>(res);
}

export interface BookingConfirmation {
  bookingReference: string;
  status: string;
  doctorName: string;
  departmentName: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export async function submitAppointmentBooking(payload: {
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
}): Promise<BookingConfirmation> {
  const res = await fetch('/api/public/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<BookingConfirmation>(res);
}

export async function submitContactEnquiry(payload: {
  fullName: string;
  mobile: string;
  email?: string;
  subject?: string;
  message: string;
}): Promise<{ ok: boolean; id: string }> {
  const res = await fetch('/api/public/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<{ ok: boolean; id: string }>(res);
}

export async function fetchAdminAuthStatus(): Promise<{
  configured: boolean;
  mode: 'env_passcode' | 'claimed_account' | 'needs_setup';
  storageBackend: 'supabase' | 'local_server_db';
}> {
  const res = await fetch('/api/admin/auth/status', { cache: 'no-store' });
  return parseJsonOrThrow(res);
}

export async function adminFetch<T>(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(url, { ...options, headers, cache: 'no-store' });
  return parseJsonOrThrow<T>(res);
}

export async function uploadAdminImage(file: File, token: string): Promise<{ imageUrl: string }> {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return parseJsonOrThrow<{ imageUrl: string }>(res);
}
