DROP TRIGGER IF EXISTS on_auth_user_created_grant_admin ON auth.users;
DROP FUNCTION IF EXISTS public.grant_first_admin();
DELETE FROM public.user_roles WHERE role = 'admin' AND user_id <> '73c16bb7-8163-4a65-a5f8-a32053c9a501'::uuid;
INSERT INTO public.user_roles (user_id, role) VALUES ('73c16bb7-8163-4a65-a5f8-a32053c9a501'::uuid, 'admin') ON CONFLICT DO NOTHING;