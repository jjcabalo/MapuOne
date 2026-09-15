-- ==============================================================================
-- Add matched_keyword column and update priority trigger
-- ==============================================================================

-- 1. Add matched_keyword column to complaints table
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS matched_keyword TEXT;

-- 2. Update the auto_route_complaint trigger function to record the keyword
CREATE OR REPLACE FUNCTION public.auto_route_complaint()
RETURNS trigger AS $$
DECLARE
  kw RECORD;
  best_match TEXT := NULL;
  current_highest INT := 0; -- 0: None, 1: LOW, 2: MEDIUM, 3: HIGH
BEGIN
  -- Default priority is MEDIUM if unclassified
  NEW.priority := 'MEDIUM';

  -- Loop through all keywords matching the chosen category
  FOR kw IN SELECT * FROM public.routing_keywords WHERE category = NEW.category
  LOOP
    -- Check if keyword is found in description or title
    IF LOWER(NEW.description) LIKE '%' || LOWER(kw.keyword) || '%' OR 
       LOWER(NEW.title) LIKE '%' || LOWER(kw.keyword) || '%' THEN
       
      IF kw.priority = 'HIGH' AND current_highest < 3 THEN
        current_highest := 3;
        best_match := kw.keyword;
      ELSIF kw.priority = 'MEDIUM' AND current_highest < 2 THEN
        current_highest := 2;
        best_match := kw.keyword;
      ELSIF kw.priority = 'LOW' AND current_highest < 1 THEN
        current_highest := 1;
        best_match := kw.keyword;
      END IF;
      
    END IF;
  END LOOP;

  -- Assign the priority based on the highest matched keyword
  IF current_highest = 3 THEN
    NEW.priority := 'HIGH';
  ELSIF current_highest = 2 THEN
    NEW.priority := 'MEDIUM';
  ELSIF current_highest = 1 THEN
    NEW.priority := 'LOW';
  END IF;

  -- Save the keyword that triggered this priority (so frontend can display it)
  NEW.matched_keyword := best_match;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
