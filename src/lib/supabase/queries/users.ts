import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@/lib/supabase/types';

export async function getCurrentUser(supabase: SupabaseClient): Promise<User | null> {
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get current user: ${error.message}`);
  }

  return data;
}

export async function getByAuthId(
  supabase: SupabaseClient,
  authId: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get user by auth_id: ${error.message}`);
  }

  return data;
}

export async function upsertUser(
  supabase: SupabaseClient,
  data: Partial<User> & { auth_id: string; email: string }
): Promise<User> {
  const { data: user, error } = await supabase
    .from('users')
    .upsert(
      {
        ...data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'auth_id' }
    )
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to upsert user: ${error.message}`);
  }

  return user;
}
