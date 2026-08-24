-- Replace has_role() usage in policies with an inline owner-role check so the
-- SECURITY DEFINER function no longer needs to be callable by signed-in users.

DROP POLICY IF EXISTS "Admins can delete photos" ON public.photos;
DROP POLICY IF EXISTS "Admins can update photos" ON public.photos;
DROP POLICY IF EXISTS "Admins can insert photos" ON public.photos;

CREATE POLICY "Admins can delete photos" ON public.photos FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));
CREATE POLICY "Admins can update photos" ON public.photos FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));
CREATE POLICY "Admins can insert photos" ON public.photos FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete albums" ON public.albums;
DROP POLICY IF EXISTS "Admins can update albums" ON public.albums;
DROP POLICY IF EXISTS "Admins can insert albums" ON public.albums;

CREATE POLICY "Admins can delete albums" ON public.albums FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));
CREATE POLICY "Admins can update albums" ON public.albums FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));
CREATE POLICY "Admins can insert albums" ON public.albums FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete photo files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update photo files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload photo files" ON storage.objects;

CREATE POLICY "Admins can delete photo files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'photos' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));
CREATE POLICY "Admins can update photo files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'photos' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));
CREATE POLICY "Admins can upload photo files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'photos' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, PUBLIC;