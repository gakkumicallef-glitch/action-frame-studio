import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/integrations/supabase/types';

/** Same-origin upload proxy: used when the bucket has no browser CORS rule. */
export const Route = createFileRoute('/api/r2-upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get('authorization') ?? '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
        if (!token) return new Response('Unauthorized', { status: 401 });

        const key = new URL(request.url).searchParams.get('key');
        if (!key || !key.startsWith('photos/')) return new Response('Bad request', { status: 400 });

        const supabaseUrl = process.env['SUPABASE_URL']!;
        const publishable = process.env['SUPABASE_PUBLISHABLE_KEY']!;
        const supabase = createClient<Database>(supabaseUrl, publishable, {
          global: {
            fetch: (input, init) => {
              const headers = new Headers(init?.headers);
              if (headers.get('Authorization') === `Bearer ${publishable}`) headers.delete('Authorization');
              headers.set('apikey', publishable);
              headers.set('Authorization', `Bearer ${token}`);
              return fetch(input, { ...init, headers });
            },
          },
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        const { data: claims } = await supabase.auth.getClaims(token);
        const userId = claims?.claims?.sub;
        if (!userId) return new Response('Unauthorized', { status: 401 });

        const { isAdminUser } = await import('@/lib/admin-check');
        if (!(await isAdminUser(supabase, userId))) return new Response('Forbidden', { status: 403 });


        const body = await request.arrayBuffer();
        if (body.byteLength > 2_000_000) return new Response('File too large', { status: 413 });

        const { presignR2 } = await import('@/lib/r2.server');
        const uploadUrl = await presignR2('PUT', key, 300);
        const res = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'content-type': request.headers.get('content-type') ?? 'image/jpeg' },
          body,
        });
        if (!res.ok) return new Response(`Upload failed (${res.status})`, { status: 502 });
        return Response.json({ key });
      },
    },
  },
});
