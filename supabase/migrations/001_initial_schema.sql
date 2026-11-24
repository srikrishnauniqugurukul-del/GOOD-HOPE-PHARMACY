-- =============================================================================
-- GOOD HOPE PHARMACY – KALIMPONG
-- Supabase PostgreSQL Schema Migration (001_initial_schema.sql)
-- Includes 14 core tables + reviews + contact enquiries + atomic booking RPC + RLS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ADMIN USERS
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'stethoscope',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DOCTORS
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  speciality TEXT NOT NULL,
  qualifications TEXT NOT NULL DEFAULT '',
  board_description TEXT NOT NULL DEFAULT '',
  registration_number TEXT NOT NULL DEFAULT '',
  affiliation TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'draft_unverified' CHECK (verification_status IN ('draft_unverified', 'verified')),
  verification_note TEXT NOT NULL DEFAULT '',
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  schedule_configured BOOLEAN NOT NULL DEFAULT FALSE,
  consultation_fee_note TEXT NOT NULL DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_department ON public.doctors(department_id);
CREATE INDEX IF NOT EXISTS idx_doctors_visible ON public.doctors(is_visible, is_active);

-- 5. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duration_minutes INT NOT NULL DEFAULT 20,
  consultation_fee NUMERIC(10, 2),
  fee_label TEXT NOT NULL DEFAULT 'Confirm at counter',
  availability_note TEXT NOT NULL DEFAULT 'By prior appointment',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  icon TEXT NOT NULL DEFAULT 'activity',
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_department ON public.services(department_id);

-- 6. CUSTOMERS (Strictly Private - Admin Only Read)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_mobile_unique ON public.customers(mobile);

-- 7. APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no-show')),
  customer_message TEXT NOT NULL DEFAULT '',
  admin_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON public.appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(booking_status);

-- Prevent double-booking of the exact same doctor/date/time slot for active appointments
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_no_double_booking
  ON public.appointments(doctor_id, appointment_date, start_time)
  WHERE booking_status IN ('pending', 'confirmed') AND start_time <> 'Enquiry';

-- 8. BUSINESS HOURS
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('pharmacy', 'doctor_consultation', 'appointment_booking')),
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT FALSE,
  open_time TEXT NOT NULL DEFAULT '',
  close_time TEXT NOT NULL DEFAULT '',
  break_start TEXT NOT NULL DEFAULT '',
  break_end TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (schedule_type, day_of_week)
);

-- 9. DOCTOR AVAILABILITY
CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  start_time TEXT NOT NULL DEFAULT '10:00',
  end_time TEXT NOT NULL DEFAULT '13:00',
  break_start TEXT NOT NULL DEFAULT '',
  break_end TEXT NOT NULL DEFAULT '',
  slot_duration_minutes INT NOT NULL DEFAULT 15,
  max_daily_bookings INT NOT NULL DEFAULT 20,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (doctor_id, day_of_week)
);

-- 10. BLOCKED DATES
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  start_time TEXT,
  end_time TEXT,
  reason TEXT NOT NULL DEFAULT 'Holiday / Unavailable',
  is_holiday BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON public.blocked_dates(blocked_date);

-- 11. GALLERY
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('pharmacy_exterior', 'pharmacy_signboard', 'good_hope_logo', 'doctor_board', 'healthcare_environment')),
  image_url TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  settings_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. REVIEWS (Verified Feedback Only)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  visit_context TEXT NOT NULL DEFAULT '',
  source_label TEXT NOT NULL DEFAULT 'Verified Patient',
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. CONTACT ENQUIRIES
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

-- Helper function checking authorized administrator status
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au
    JOIN public.profiles p ON p.id = au.profile_id
    WHERE p.auth_user_id = auth.uid() AND au.is_active = TRUE
  );
$$;

-- Public read policies (approved/active public catalog only)
CREATE POLICY "Public read active departments" ON public.departments
  FOR SELECT USING (is_active = TRUE OR public.is_admin_user());

CREATE POLICY "Public read visible doctors" ON public.doctors
  FOR SELECT USING ((is_visible = TRUE AND is_active = TRUE) OR public.is_admin_user());

CREATE POLICY "Public read active services" ON public.services
  FOR SELECT USING ((is_visible = TRUE AND is_active = TRUE) OR public.is_admin_user());

CREATE POLICY "Public read business hours" ON public.business_hours
  FOR SELECT USING (TRUE);

CREATE POLICY "Public read doctor availability" ON public.doctor_availability
  FOR SELECT USING (TRUE);

CREATE POLICY "Public read blocked dates" ON public.blocked_dates
  FOR SELECT USING (TRUE);

CREATE POLICY "Public read published gallery" ON public.gallery
  FOR SELECT USING (is_published = TRUE OR public.is_admin_user());

CREATE POLICY "Public read site settings" ON public.site_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Public read approved reviews" ON public.reviews
  FOR SELECT USING ((is_approved = TRUE AND is_visible = TRUE) OR public.is_admin_user());

-- Strictly admin-only policies for private tables (customers, appointments, notifications, audit_logs, contact_enquiries)
CREATE POLICY "Admin only customers" ON public.customers
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin only appointments" ON public.appointments
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin only notifications" ON public.notifications
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin only audit logs" ON public.audit_logs
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin only enquiries" ON public.contact_enquiries
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin manage doctors" ON public.doctors
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin manage departments" ON public.departments
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin manage services" ON public.services
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin manage gallery" ON public.gallery
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin manage settings" ON public.site_settings
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin manage schedules" ON public.doctor_availability
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin manage blocked dates" ON public.blocked_dates
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin manage hours" ON public.business_hours
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- =============================================================================
-- ATOMIC TRANSACTIONAL BOOKING FUNCTION (Prevents double booking at DB level)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.book_appointment_atomic(
  p_customer_name TEXT,
  p_customer_mobile TEXT,
  p_customer_email TEXT,
  p_department_id UUID,
  p_service_id UUID,
  p_doctor_id UUID,
  p_appointment_date DATE,
  p_start_time TEXT,
  p_end_time TEXT,
  p_customer_message TEXT
)
RETURNS TABLE(booking_reference TEXT, appointment_id UUID, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id UUID;
  v_ref TEXT;
  v_appt_id UUID;
BEGIN
  -- Serialize bookings per doctor + date using advisory transaction lock
  PERFORM pg_advisory_xact_lock(hashtext(p_doctor_id::text || ':' || p_appointment_date::text));

  -- Check full-day or slot-specific blocked dates
  IF EXISTS (
    SELECT 1 FROM public.blocked_dates bd
    WHERE bd.blocked_date = p_appointment_date
      AND (bd.doctor_id IS NULL OR bd.doctor_id = p_doctor_id)
      AND (bd.start_time IS NULL OR bd.start_time = p_start_time)
  ) THEN
    RAISE EXCEPTION 'Selected date or time slot is blocked.';
  END IF;

  -- Prevent duplicate slot booking
  IF p_start_time <> 'Enquiry' AND EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.doctor_id = p_doctor_id
      AND a.appointment_date = p_appointment_date
      AND a.start_time = p_start_time
      AND a.booking_status IN ('pending', 'confirmed')
  ) THEN
    RAISE EXCEPTION 'This appointment slot has already been booked.';
  END IF;

  -- Upsert customer by mobile
  INSERT INTO public.customers(full_name, mobile, email)
  VALUES (p_customer_name, p_customer_mobile, COALESCE(p_customer_email, ''))
  ON CONFLICT (mobile) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = CASE WHEN EXCLUDED.email <> '' THEN EXCLUDED.email ELSE public.customers.email END,
    updated_at = NOW()
  RETURNING id INTO v_customer_id;

  v_ref := 'GHP-' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'YYYYMMDD') || '-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 4));

  INSERT INTO public.appointments (
    booking_reference, customer_id, doctor_id, department_id, service_id,
    appointment_date, start_time, end_time, booking_status, customer_message
  )
  VALUES (
    v_ref, v_customer_id, p_doctor_id, p_department_id, p_service_id,
    p_appointment_date, p_start_time, p_end_time, 'pending', COALESCE(p_customer_message, '')
  )
  RETURNING id INTO v_appt_id;

  INSERT INTO public.notifications (notification_type, title, message, related_id)
  VALUES (
    'appointment_new',
    'New Appointment Request (' || v_ref || ')',
    p_customer_name || ' requested an appointment on ' || p_appointment_date::TEXT || ' at ' || p_start_time,
    v_appt_id
  );

  RETURN QUERY SELECT v_ref, v_appt_id, 'pending'::TEXT;
END;
$$;

-- 17. SHARED SERVER STATE (Service-role only — syncs admin credentials & site config across environments)
CREATE TABLE IF NOT EXISTS public.app_shared_state (
  state_key TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_shared_state ENABLE ROW LEVEL SECURITY;
-- No anon or authenticated client policies: strictly accessible via server-side SUPABASE_SECRET_KEY.

