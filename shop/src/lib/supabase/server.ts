import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  getSupabasePublicConfig,
  hasSupabasePublicConfig,
  hasSupabaseServiceConfig,
} from "./config";

export async function createSupabaseServerClient() {
  if (!hasSupabasePublicConfig()) return null;

  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabasePublicConfig();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components mogen cookies niet muteren. Route Handlers en
          // server actions doen dat wel; de Proxy ververst sessies tussendoor.
        }
      },
    },
  });
}

export function createSupabaseAdminClient() {
  if (!hasSupabaseServiceConfig()) return null;

  const { url } = getSupabasePublicConfig();
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
