CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES public.landlords(id) ON DELETE CASCADE,
  preferences jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(landlord_id)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords can manage own notification preferences"
  ON public.notification_preferences
  FOR ALL
  USING (
    landlord_id IN (
      SELECT l.id FROM public.landlords l
      WHERE l.user_id = auth.uid()
    )
  )
  WITH CHECK (
    landlord_id IN (
      SELECT l.id FROM public.landlords l
      WHERE l.user_id = auth.uid()
    )
  );
