
-- 1. Consultations table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  consultation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint TEXT,
  examination_findings TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  medications TEXT,
  immunotherapy_status TEXT,
  follow_up_date DATE,
  clinical_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX consultations_patient_id_date_idx
  ON public.consultations (patient_id, consultation_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultations TO authenticated;
GRANT ALL ON public.consultations TO service_role;

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read consultations"
  ON public.consultations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert consultations"
  ON public.consultations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update consultations"
  ON public.consultations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete consultations"
  ON public.consultations FOR DELETE TO authenticated USING (true);

CREATE TRIGGER set_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Tighten patients policies: replace permissive "MVP open" policies with
--    authenticated-only access now that login is required.
DROP POLICY IF EXISTS "MVP open read on patients" ON public.patients;
DROP POLICY IF EXISTS "MVP open insert on patients" ON public.patients;
DROP POLICY IF EXISTS "MVP open update on patients" ON public.patients;
DROP POLICY IF EXISTS "MVP open delete on patients" ON public.patients;

REVOKE ALL ON public.patients FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;

CREATE POLICY "Authenticated users can read patients"
  ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert patients"
  ON public.patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update patients"
  ON public.patients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete patients"
  ON public.patients FOR DELETE TO authenticated USING (true);
