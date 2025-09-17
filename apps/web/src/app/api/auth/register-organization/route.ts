import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const registerOrganizationSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(50, 'Subdomain must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = registerOrganizationSchema.parse(body);

    // Forward the request to the backend API
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register-organization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    const responseData = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { message: responseData.message || 'Registration failed' },
        { status: apiResponse.status }
      );
    }

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        },
        { status: 400 }
      );
    }

    console.error('Organization registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
