// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL'
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : 'https://placeholder-url.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY !== 'YOUR_SUPABASE_PUBLISHABLE_KEY'
    ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    : 'placeholder-anon-key';

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'YOUR_SUPABASE_SERVICE_ROLE_KEY'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : 'placeholder-service-role-key';

/**
 * Supabase client used by browser & client-side components (public anon key).
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side admin client with service-role key.
 * Used exclusively in API routes / server actions to bypass RLS when required.
 * Never exposed to client-side JS bundles.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
