
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other');

CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender public.gender_type,
  phone TEXT,
  email TEXT,
  address TEXT,
  blood_group TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX patients_last_name_idx ON public.patients (last_name);
CREATE INDEX patients_phone_idx ON public.patients (phone);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- MVP policies: open access until auth is wired in a later phase.
CREATE POLICY "MVP open read on patients"
  ON public.patients FOR SELECT
  USING (true);

CREATE POLICY "MVP open insert on patients"
  ON public.patients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "MVP open update on patients"
  ON public.patients FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "MVP open delete on patients"
  ON public.patients FOR DELETE
  USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER patients_set_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
