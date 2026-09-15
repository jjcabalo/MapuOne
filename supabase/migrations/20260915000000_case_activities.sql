-- ==============================================================================
-- Add case_activities table and trigger
-- ==============================================================================

CREATE TABLE public.case_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.case_activities ENABLE ROW LEVEL SECURITY;

-- Users can view activities on complaints they can access
CREATE POLICY "Users can view accessible case activities" ON public.case_activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.complaints 
    WHERE public.complaints.id = case_activities.complaint_id 
    AND (
      public.complaints.complainant_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'HANDLER'))
    )
  )
);

-- Note: No INSERT/UPDATE/DELETE policies needed for clients, because insertions are handled purely by a SECURITY DEFINER trigger.

-- ------------------------------------------------------------------------------
-- Triggers for Case Activities
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.log_case_activity()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.case_activities (complaint_id, actor_id, action_text)
    VALUES (NEW.id, auth.uid(), 'CASE OPENED - Routed to ' || NEW.category);
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.case_activities (complaint_id, actor_id, action_text)
      VALUES (NEW.id, auth.uid(), 'STATUS CHANGED to ' || NEW.status);
    END IF;

    IF OLD.priority IS DISTINCT FROM NEW.priority THEN
      INSERT INTO public.case_activities (complaint_id, actor_id, action_text)
      VALUES (NEW.id, auth.uid(), 'PRIORITY CHANGED to ' || NEW.priority);
    END IF;

    IF OLD.category IS DISTINCT FROM NEW.category THEN
      INSERT INTO public.case_activities (complaint_id, actor_id, action_text)
      VALUES (NEW.id, auth.uid(), 'CATEGORY CHANGED to ' || NEW.category);
    END IF;

    IF OLD.assigned_handler_id IS DISTINCT FROM NEW.assigned_handler_id THEN
      IF NEW.assigned_handler_id IS NOT NULL THEN
        -- Optionally, we could look up the handler's name, but storing just that it was reassigned is usually enough
        INSERT INTO public.case_activities (complaint_id, actor_id, action_text)
        VALUES (NEW.id, auth.uid(), 'ASSIGNED HANDLER CHANGED');
      ELSE
        INSERT INTO public.case_activities (complaint_id, actor_id, action_text)
        VALUES (NEW.id, auth.uid(), 'HANDLER UNASSIGNED');
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_complaint_activity
  AFTER INSERT OR UPDATE ON public.complaints
  FOR EACH ROW EXECUTE PROCEDURE public.log_case_activity();
