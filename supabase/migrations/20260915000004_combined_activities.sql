-- ==============================================================================
-- Update case_activities trigger to combine updates into one string
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.log_case_activity()
RETURNS trigger AS $$
DECLARE
  update_parts TEXT[] := ARRAY[]::TEXT[];
  final_text TEXT := '';
  handler_name TEXT := '';
  handler_dept TEXT := '';
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.case_activities (complaint_id, actor_id, action_text)
    VALUES (NEW.id, auth.uid(), 'CASE OPENED - Routed to ' || REPLACE(NEW.category::text, '_', ' '));
    
  ELSIF TG_OP = 'UPDATE' THEN
    
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      update_parts := array_append(update_parts, 'Status Changed to ' || REPLACE(INITCAP(NEW.status::text), '_', ' '));
    END IF;

    IF OLD.priority IS DISTINCT FROM NEW.priority THEN
      update_parts := array_append(update_parts, 'Marked as ' || NEW.priority || ' Priority');
    END IF;
    
    IF OLD.category IS DISTINCT FROM NEW.category THEN
      update_parts := array_append(update_parts, 'Category Changed to ' || REPLACE(INITCAP(NEW.category::text), '_', ' '));
    END IF;

    IF OLD.assigned_handler_id IS DISTINCT FROM NEW.assigned_handler_id AND NEW.assigned_handler_id IS NOT NULL THEN
      SELECT 
        LEFT(first_name, 1) || '. ' || last_name, 
        COALESCE(department, 'Handler')
      INTO handler_name, handler_dept 
      FROM public.users WHERE id = NEW.assigned_handler_id;
      
      update_parts := array_append(update_parts, 'Assigned to ' || handler_name || ', ' || handler_dept);
    ELSIF OLD.assigned_handler_id IS DISTINCT FROM NEW.assigned_handler_id AND NEW.assigned_handler_id IS NULL THEN
      update_parts := array_append(update_parts, 'Handler Unassigned');
    END IF;
    
    IF array_length(update_parts, 1) > 0 THEN
      IF array_length(update_parts, 1) = 1 THEN
        final_text := update_parts[1];
      ELSIF array_length(update_parts, 1) = 2 THEN
        final_text := update_parts[1] || ' and ' || update_parts[2];
      ELSE
        final_text := update_parts[1] || ' and ' || update_parts[2];
        FOR i IN 3..array_length(update_parts, 1) LOOP
          final_text := final_text || ' - ' || update_parts[i];
        END LOOP;
      END IF;
      
      INSERT INTO public.case_activities (complaint_id, actor_id, action_text)
      VALUES (NEW.id, auth.uid(), final_text);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
