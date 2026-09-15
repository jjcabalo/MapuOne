-- ==============================================================================
-- MapuOne Supabase Database Schema
-- Based on Important-Feats-Checklist.md and SSO Mock requirements
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Custom Types / Enums
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('STUDENT', 'FACULTY', 'STAFF', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE complaint_category AS ENUM ('FACILITIES', 'ACADEMIC_AFFAIRS', 'IT_SUPPORT', 'STUDENT_SERVICES');
CREATE TYPE complaint_status AS ENUM ('OPEN', 'IN_PROCESS', 'PENDING_RESPONSE', 'RESOLVED');
CREATE TYPE complaint_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- ------------------------------------------------------------------------------
-- 2. Tables
-- ------------------------------------------------------------------------------

CREATE TABLE public.sso_mock_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('USER', 'ADMIN')), 
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT,
  course TEXT,
  department TEXT,
  role TEXT,
  handled_categories TEXT,
  status account_status DEFAULT 'ACTIVE',
  is_registered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role DEFAULT 'STUDENT',
  id_number TEXT,
  course TEXT,
  department TEXT,
  handled_categories TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number SERIAL UNIQUE,
  complainant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category complaint_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status complaint_status DEFAULT 'OPEN',
  priority complaint_priority DEFAULT 'MEDIUM',
  assigned_department TEXT,
  assigned_handler_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE public.complaint_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.routing_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT UNIQUE NOT NULL,
  category complaint_category NOT NULL,
  priority complaint_priority DEFAULT 'MEDIUM',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. Functions & Triggers
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  sso_record public.sso_mock_accounts%ROWTYPE;
BEGIN
  SELECT * INTO sso_record FROM public.sso_mock_accounts WHERE email = NEW.email;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration failed: Email not found in SSO system. Please use a valid Mapua email.';
  END IF;

  INSERT INTO public.users (
    id, email, first_name, last_name, id_number, course, department, role, handled_categories
  ) VALUES (
    NEW.id, NEW.email, sso_record.first_name, sso_record.last_name, sso_record.id_number,
    sso_record.course, sso_record.department,
    CASE WHEN sso_record.type = 'ADMIN' THEN 'ADMIN'::user_role ELSE 'STUDENT'::user_role END,
    sso_record.handled_categories
  );

  UPDATE public.sso_mock_accounts SET is_registered = TRUE WHERE id = sso_record.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 4. Enable Row Level Security (RLS) & Policies
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.sso_mock_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routing_keywords ENABLE ROW LEVEL SECURITY;

-- 1. SSO Mock Accounts: No client access needed. Only accessed securely by the trigger (which runs as SUPERUSER via SECURITY DEFINER).

-- 2. Users Table Policies
-- Users can read all profiles (needed for showing names in comments/complaints).
CREATE POLICY "Users can view all user profiles" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
-- Users can only update their own profile.
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 3. Complaints Table Policies
-- Users can view their own complaints, admins can view all.
CREATE POLICY "Users can view own complaints or admins view all" ON public.complaints FOR SELECT USING (
  auth.uid() = complainant_id OR 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);
-- Users can insert their own complaints.
CREATE POLICY "Users can create complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = complainant_id);
-- Admins can update complaints, users can update if status is OPEN.
CREATE POLICY "Update permissions for complaints" ON public.complaints FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')) OR
  (auth.uid() = complainant_id AND status = 'OPEN')
);

-- 4. Comments Table Policies
-- Users can view comments on complaints they have access to.
CREATE POLICY "View comments on accessible complaints" ON public.comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND (c.complainant_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'SUPER_ADMIN'))))
);
-- Users can create comments on their own complaints, admins can create on all.
CREATE POLICY "Create comments" ON public.comments FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND (c.complainant_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'SUPER_ADMIN'))))
);

-- 5. Notifications Table Policies
-- Users can only see and update their own notifications.
CREATE POLICY "View own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 6. Attachments Table Policies
CREATE POLICY "View attachments on accessible complaints" ON public.complaint_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND (c.complainant_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'SUPER_ADMIN'))))
);
CREATE POLICY "Create attachments" ON public.complaint_attachments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND c.complainant_id = auth.uid())
);

-- ------------------------------------------------------------------------------
-- 5. Initial Seed Data
-- ------------------------------------------------------------------------------
INSERT INTO public.sso_mock_accounts (email, type, first_name, last_name, id_number, course, status)
VALUES 
  ('jdelacruz@mymail.mapua.edu.ph', 'USER', 'Juan', 'Dela Cruz', '2026101111', 'BS Computer Science', 'ACTIVE'),
  ('zpedregosa@mymail.mapua.edu.ph', 'USER', 'Z', 'Pedregosa', '2026102222', 'BS Information Technology', 'INACTIVE');

INSERT INTO public.sso_mock_accounts (email, type, first_name, last_name, department, role, handled_categories, status)
VALUES 
  ('lpenaflor@mapua.edu.ph', 'ADMIN', 'L', 'Penaflor', 'Facilities Management', 'Staff', 'FACILITIES', 'ACTIVE'),
  ('afrancisco@mapua.edu.ph', 'ADMIN', 'A', 'Francisco', 'IT Support', 'Admin', 'IT_SUPPORT', 'ACTIVE');

INSERT INTO public.routing_keywords (keyword, category, priority)
VALUES
  ('aircon', 'FACILITIES', 'MEDIUM'),
  ('broken chair', 'FACILITIES', 'LOW'),
  ('wifi', 'IT_SUPPORT', 'HIGH'),
  ('canvas', 'IT_SUPPORT', 'HIGH'),
  ('grade', 'ACADEMIC_AFFAIRS', 'HIGH'),
  ('enrollment', 'STUDENT_SERVICES', 'HIGH'),
  ('scholarship', 'STUDENT_SERVICES', 'MEDIUM');
