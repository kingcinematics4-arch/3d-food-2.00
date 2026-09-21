// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { signUpAndOnboardHotel, signUpSchema } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);

    const result = await signUpAndOnboardHotel(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Hotel created successfully!',
        hotel: result.hotel,
        userId: result.userId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Onboarding Signup API Error:', error);
    const errorMessage =
      error?.message ||
      (typeof error === 'string' ? error : 'An unexpected error occurred during hotel onboarding');

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    );
  }
}
