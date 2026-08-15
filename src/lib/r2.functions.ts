import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

/** Admin-only: presigned PUT URL for a direct browser upload to R2. */
export const presignPhotoUpload = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        fileName: z.string().min(1).max(200),
        contentType: z.string().min(3).max(100),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    });
    if (error || !isAdmin) throw new Error('Forbidden');
    if (!data.contentType.startsWith('image/')) throw new Error('Only images can be uploaded');

    const { presignR2, ensureR2Cors } = await import('./r2.server');
    await ensureR2Cors();

    const ext = data.fileName.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
    const key = `photos/${crypto.randomUUID()}.${ext}`;
    const uploadUrl = await presignR2('PUT', key, 900);
    return { key, uploadUrl };
  });

/** Public: short-lived read URLs for stored photo keys. */
export const signPhotoUrls = createServerFn({ method: 'POST' })
  .inputValidator((input) => z.object({ keys: z.array(z.string().min(1)).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { presignR2 } = await import('./r2.server');
    const entries = await Promise.all(
      data.keys.map(async (key) => [key, await presignR2('GET', key, 60 * 60 * 6)] as const),
    );
    return Object.fromEntries(entries) as Record<string, string>;
  });

/** Admin-only: delete a stored object from R2. */
export const deletePhotoObject = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ key: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'admin',
    });
    if (error || !isAdmin) throw new Error('Forbidden');
    const { presignR2 } = await import('./r2.server');
    const url = await presignR2('GET', data.key, 300);
    const res = await fetch(url.replace('X-Amz-SignedHeaders', 'X-Amz-SignedHeaders'), { method: 'DELETE' });
    return { ok: res.ok };
  });
