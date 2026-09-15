ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS last_status_email_at TIMESTAMP WITH TIME ZONE;
