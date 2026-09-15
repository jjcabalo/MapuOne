-- ==============================================================================
-- Update RLS Policies to allow HANDLER access
-- ==============================================================================

-- 1. Complaints Table (HANDLER can view all complaints to pick them from the queue, or at least view their assigned ones)
-- We will allow HANDLER to view all complaints, since the frontend queue logic filters by department anyway.
DROP POLICY IF EXISTS "Users can view own complaints or admins view all" ON public.complaints;
CREATE POLICY "Users can view own complaints or admins view all" ON public.complaints FOR SELECT USING (
  auth.uid() = complainant_id OR 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'HANDLER'))
);

-- HANDLER needs to UPDATE complaints (status, priority, assigning to themselves)
DROP POLICY IF EXISTS "Admins can update complaints" ON public.complaints;
CREATE POLICY "Admins can update complaints" ON public.complaints FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'HANDLER'))
);

-- 2. Complaint Attachments Table (HANDLER needs to view them)
DROP POLICY IF EXISTS "View attachments on accessible complaints" ON public.complaint_attachments;
CREATE POLICY "View attachments on accessible complaints" ON public.complaint_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND (c.complainant_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'SUPER_ADMIN', 'HANDLER'))))
);

-- 3. Comments Table (HANDLER needs to view and create comments)
DROP POLICY IF EXISTS "View comments on accessible complaints" ON public.comments;
CREATE POLICY "View comments on accessible complaints" ON public.comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND (c.complainant_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'SUPER_ADMIN', 'HANDLER'))))
);

DROP POLICY IF EXISTS "Create comments" ON public.comments;
CREATE POLICY "Create comments" ON public.comments FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_id AND (c.complainant_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'SUPER_ADMIN', 'HANDLER'))))
);
