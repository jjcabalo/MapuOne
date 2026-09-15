-- ==============================================================================
-- Backend Trigger for Automated 3-tier Priority Ranking
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.auto_route_complaint()
RETURNS trigger AS $$
DECLARE
  kw RECORD;
  found_high BOOLEAN := FALSE;
  found_medium BOOLEAN := FALSE;
  found_low BOOLEAN := FALSE;
BEGIN
  -- Default priority is MEDIUM if unclassified
  NEW.priority := 'MEDIUM';

  -- Loop through all keywords matching the chosen category
  FOR kw IN SELECT * FROM public.routing_keywords WHERE category = NEW.category
  LOOP
    -- Check if keyword is found in description or title
    IF LOWER(NEW.description) LIKE '%' || LOWER(kw.keyword) || '%' OR 
       LOWER(NEW.title) LIKE '%' || LOWER(kw.keyword) || '%' THEN
       
      IF kw.priority = 'HIGH' THEN
        found_high := TRUE;
      ELSIF kw.priority = 'MEDIUM' THEN
        found_medium := TRUE;
      ELSIF kw.priority = 'LOW' THEN
        found_low := TRUE;
      END IF;
      
    END IF;
  END LOOP;

  -- Highest matched priority wins
  IF found_high THEN
    NEW.priority := 'HIGH';
  ELSIF found_medium THEN
    NEW.priority := 'MEDIUM';
  ELSIF found_low THEN
    NEW.priority := 'LOW';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run BEFORE a new complaint is inserted
DROP TRIGGER IF EXISTS trigger_auto_route_complaint ON public.complaints;
CREATE TRIGGER trigger_auto_route_complaint
  BEFORE INSERT ON public.complaints
  FOR EACH ROW EXECUTE PROCEDURE public.auto_route_complaint();
