-- 1. Ensure HANDLER is in the enum (just in case)
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'HANDLER';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'STAFF';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'FACULTY';

-- 2. Replace the trigger with a completely foolproof version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  mock_row public.sso_mock_accounts%ROWTYPE;
BEGIN
  -- 1. Safely look up the email
  SELECT * INTO mock_row 
  FROM public.sso_mock_accounts 
  WHERE LOWER(TRIM(public.sso_mock_accounts.email)) = LOWER(TRIM(NEW.email))
  LIMIT 1;
  
  -- 2. If not found, raise exception
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration failed: Email not found in SSO system. Please use a valid Mapua email.';
  END IF;

  -- 3. Safely insert into public.users using explicit CASE mapping to avoid casting errors
  INSERT INTO public.users (
    id, 
    email, 
    first_name, 
    last_name, 
    id_number, 
    course, 
    department, 
    role, 
    handled_categories
  ) VALUES (
    NEW.id, 
    NEW.email, 
    mock_row.first_name, 
    mock_row.last_name, 
    mock_row.id_number,
    mock_row.course, 
    mock_row.department,
    CASE 
      WHEN mock_row.role = 'ADMIN' THEN 'ADMIN'::public.user_role
      WHEN mock_row.role = 'HANDLER' THEN 'HANDLER'::public.user_role
      WHEN mock_row.role = 'STAFF' THEN 'STAFF'::public.user_role
      WHEN mock_row.role = 'FACULTY' THEN 'FACULTY'::public.user_role
      ELSE 'STUDENT'::public.user_role
    END,
    mock_row.handled_categories
  );

  -- 4. Mark as registered
  UPDATE public.sso_mock_accounts 
  SET is_registered = TRUE 
  WHERE id = mock_row.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
