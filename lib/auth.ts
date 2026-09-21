// lib/auth.ts
import { supabaseAdmin } from './supabaseClient';
import { z } from 'zod';

/**
 * Validation schema for hotel sign‑up & onboarding.
 */
export const signUpSchema = z.object({
  hotel_name: z.string().min(2, 'Hotel name must be at least 2 characters'),
  owner_name: z.string().min(2, 'Owner name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  city: z.string().min(2, 'City must be provided'),
  address: z.string().min(5, 'Address must be provided'),
  phone: z.string().min(5, 'Phone number must be provided'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Generate a URL-friendly slug from hotel name
 */
export function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Multi-tenant Onboarding: Creates Auth User -> Inserts Hotel -> Links User to Hotel
 */
export async function signUpAndOnboardHotel(data: SignUpInput) {
  // 1. Create Supabase Auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        owner_name: data.owner_name,
        hotel_name: data.hotel_name,
      },
    },
  });

  if (authError) {
    throw new Error(`Auth Signup Error: ${authError.message}`);
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error('Supabase Auth user created but failed to return user ID.');
  }

  // 2. Generate slug and insert hotel record into 'hotels' table
  const slug = generateSlug(data.hotel_name);
  const { data: hotelData, error: hotelError } = await supabaseAdmin
    .from('hotels')
    .insert({
      name: data.hotel_name,
      slug: slug,
      owner_name: data.owner_name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      address: data.address,
      is_active: true,
      subscription_plan: 'starter',
    })
    .select()
    .single();

  if (hotelError) {
    throw new Error(`Hotel Creation Error (${hotelError.code}): ${hotelError.message} - ${hotelError.details || ''}`);
  }

  // 3. Link user to hotel in 'hotel_users' table
  const { error: linkError } = await supabaseAdmin
    .from('hotel_users')
    .insert({
      user_id: userId,
      hotel_id: hotelData.id,
      role: 'owner',
    });

  if (linkError) {
    throw new Error(`User-Hotel Linking Error (${linkError.code}): ${linkError.message}`);
  }

  return {
    userId,
    hotel: hotelData,
    user: authData.user,
  };
}

/**
 * Fetch the hotel and user link details for an authenticated user
 */
export async function getUserHotel(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('hotel_users')
    .select('*, hotel:hotels(*)')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
}
