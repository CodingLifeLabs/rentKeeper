CREATE TABLE IF NOT EXISTS public.export_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES public.landlords(id) ON DELETE CASCADE,
  export_type text NOT NULL CHECK (export_type IN ('csv', 'xlsx', 'zip')),
  exported_at timestamptz DEFAULT now(),
  row_count integer NOT NULL DEFAULT 0,
  include_phone boolean NOT NULL DEFAULT false
);

ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage own export logs"
  ON public.export_logs
  FOR ALL
  USING (
    landlord_id IN (
      SELECT l.id FROM public.landlords l
      WHERE l.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    landlord_id IN (
      SELECT l.id FROM public.landlords l
      WHERE l.user_id = auth.uid()::text
    )
  );
