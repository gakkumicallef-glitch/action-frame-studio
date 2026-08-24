import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Checks whether the given user has the admin role.
 * Reads public.user_roles directly (RLS only exposes the caller's own rows),
 * so no SECURITY DEFINER function needs to be callable by signed-in users.
 */
export async function isAdminUser(
  client: SupabaseClient<any, any, any>,
  userId: string,
): Promise<boolean> {
  const { data, error } = await client
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();
  if (error) return false;
  return !!data;
}
