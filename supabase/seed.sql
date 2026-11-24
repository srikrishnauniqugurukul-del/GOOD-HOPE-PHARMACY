-- =============================================================================
-- GOOD HOPE PHARMACY – KALIMPONG
-- Initial Seed Data (supabase/seed.sql)
-- All 8 doctors transcribed from clinic board in draft_unverified state
-- =============================================================================

INSERT INTO public.departments (name, slug, description, icon, display_order) VALUES
  ('ENT & Head-Neck Surgery', 'ent-head-neck', 'Ear, Nose, Throat, Vertigo, Balance & Head-Neck consultations.', 'ear', 1),
  ('Gynaecology & Obstetrics', 'gynaecology-obstetrics', 'Women''s healthcare, obstetrics, laparoscopic surgery & infertility consultations.', 'heart-pulse', 2),
  ('Child Specialist & Pediatrics', 'pediatrics', 'Child health, pediatric medicine & neonatology consultations.', 'baby', 3),
  ('Physician / Internal Medicine', 'internal-medicine', 'General medicine, adult health & internal medicine consultations.', 'stethoscope', 4),
  ('Physiology & General Consultation', 'physiology', 'Physiology consultation (designation transcribed from clinic board for verification).', 'activity', 5),
  ('General Surgery', 'general-surgery', 'General surgical consultation and evaluation.', 'shield-plus', 6),
  ('Pharmacy Information & Enquiry', 'pharmacy-enquiry', 'In-store pharmacy information and customer enquiries (informational only).', 'pill', 7)
ON CONFLICT (slug) DO NOTHING;

-- Note: Run this seed after departments are created. Doctors start in draft_unverified state
-- until the administrator verifies credentials, registrations, and schedules.
INSERT INTO public.doctors (
  department_id, name, slug, speciality, qualifications, board_description,
  registration_number, affiliation, verification_status, verification_note, display_order
)
SELECT d.id, v.name, v.slug, v.speciality, v.qualifications, v.board_description,
       v.registration_number, v.affiliation, 'draft_unverified', v.verification_note, v.display_order
FROM (VALUES
  ('ent-head-neck', 'Dr. D.K. Gupta', 'dr-d-k-gupta', 'ENT & Head-Neck Surgery', 'Consultant ENT & Head-Neck Surgeon', 'Consultant ENT & Head-Neck Surgeon. Expert in Vertigo, Ear Disorders & Balance Treatment.', 'WBMC-68227', 'District Hospital, Kalimpong', 'Verify credentials and consultation hours before publishing as verified.', 1),
  ('gynaecology-obstetrics', 'Dr. Sanjay Mazumder', 'dr-sanjay-mazumder', 'Gynaecology & Obstetrics', 'M.B.B.S., MS (OBST & GYNAE), FART, FMAS (DELHI), WBHS', 'Consultant: Gynaecologist, Obstetrician, Laparoscopic Surgeon & Infertility Specialist.', '', '', 'Preserve printed qualifications and verify before publishing.', 2),
  ('ent-head-neck', 'Dr. Ibrahim Shakuli', 'dr-ibrahim-shakuli', 'ENT', 'MBBS, MS (ENT), Kolkata', 'Consultant ENT Surgeon.', 'WBMC-55496', 'District Hospital, Kalimpong', 'Verify registration and schedule before publishing as verified.', 3),
  ('pediatrics', 'Dr. Ayan Dutta', 'dr-ayan-dutta', 'Child Specialist & Physician', 'MBBS, MD (Pediatrics)', 'Child Specialist & Physician. Pediatrician & Neonatologist.', '', 'District Hospital, Kalimpong', 'Verify credentials and schedule before publishing as verified.', 4),
  ('internal-medicine', 'Dr. R.O. Karthak', 'dr-r-o-karthak', 'Physician / Internal Medicine', 'MBBS, Medical College NRS (Kolkata), M.D. Medicine (Physician)', 'Physician / Internal Medicine specialist.', 'WBMC-59257', 'District Hospital, Kalimpong', 'Verify registration and consultation timings before publishing.', 5),
  ('physiology', 'Dr. Swarup Kumar Khan', 'dr-swarup-kumar-khan', 'Physiologist', 'MBBS', 'Physiologist (exact speciality label printed on the clinic board).', '', 'District Hospital, Kalimpong', 'IMPORTANT: Verify exact professional speciality designation with the doctor before publishing.', 6),
  ('gynaecology-obstetrics', 'Dr. Krishanu Sarkar', 'dr-krishanu-sarkar', 'Gynaecology & Obstetrics', 'MBBS (Kolkata), DNB (G&O)', 'Gynae, Obs & Infertility Specialist.', '', '', 'Verify qualifications and consultation timings before publishing.', 7),
  ('general-surgery', 'Dr. Ramkrishna Karmakar', 'dr-ramkrishna-karmakar', 'General Surgeon', '', 'General Surgeon.', '', '', 'Verify qualifications, registration, and consultation timings before publishing.', 8)
) AS v(dept_slug, name, slug, speciality, qualifications, board_description, registration_number, affiliation, verification_note, display_order)
JOIN public.departments d ON d.slug = v.dept_slug
ON CONFLICT (slug) DO NOTHING;
