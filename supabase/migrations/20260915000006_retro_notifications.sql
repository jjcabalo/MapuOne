-- Retroactively create notifications for all existing case activities that don't have one
DO $$ 
DECLARE 
  activity RECORD;
  c_user_id UUID;
  c_ticket INT;
  c_year TEXT;
BEGIN
  FOR activity IN SELECT * FROM public.case_activities 
  LOOP
    -- Get complaint info
    SELECT complainant_id, ticket_number, TO_CHAR(created_at, 'YYYY') 
    INTO c_user_id, c_ticket, c_year 
    FROM public.complaints 
    WHERE id = activity.complaint_id;

    -- If this activity doesn't already have an exact matching notification for this user
    IF c_user_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.notifications 
      WHERE user_id = c_user_id 
      AND complaint_id = activity.complaint_id 
      AND message = activity.action_text
    ) THEN
      INSERT INTO public.notifications (user_id, complaint_id, title, message, created_at, is_read)
      VALUES (
        c_user_id, 
        activity.complaint_id, 
        'Update on Case MU-' || c_year || '-' || LPAD(c_ticket::TEXT, 3, '0'), 
        activity.action_text,
        activity.created_at, -- preserve original date
        false
      );
    END IF;
  END LOOP;
END $$;
