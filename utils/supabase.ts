import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export function createSupabaseClerkClient(accessToken: Promise<string | null>) {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    accessToken: () => accessToken
  });
}