-- Make the trigger case-insensitive and trim spaces when looking up the email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  sso_record public.sso_mock_accounts%ROWTYPE;
BEGIN
  -- Look up the mock account using a case-insensitive and trimmed email comparison
  SELECT * INTO sso_record 
  FROM public.sso_mock_accounts 
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email));
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration failed: Email not found in SSO system. Please use a valid Mapua email.';
  END IF;

  INSERT INTO public.users (
    id, email, first_name, last_name, id_number, course, department, role, handled_categories
  ) VALUES (
    NEW.id, NEW.email, sso_record.first_name, sso_record.last_name, sso_record.id_number,
    sso_record.course, sso_record.department,
    COALESCE(sso_record.role::user_role, 'STUDENT'::user_role),
    sso_record.handled_categories
  );

  UPDATE public.sso_mock_accounts SET is_registered = TRUE WHERE id = sso_record.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
