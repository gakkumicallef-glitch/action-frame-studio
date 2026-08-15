CREATE TABLE public.albums (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.albums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.albums TO authenticated;
GRANT ALL ON public.albums TO service_role;

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Albums are viewable by everyone" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Admins can insert albums" ON public.albums FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update albums" ON public.albums FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete albums" ON public.albums FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON public.albums
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.photos
  ADD COLUMN album_id uuid REFERENCES public.albums(id) ON DELETE SET NULL,
  ADD COLUMN is_hero boolean NOT NULL DEFAULT false;

CREATE INDEX photos_album_id_idx ON public.photos(album_id);