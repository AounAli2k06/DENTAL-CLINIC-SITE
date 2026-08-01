import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/src/lib/mongodb';
import User from '@/src/models/User';
import { signAdminToken, setAuthCookie } from '@/src/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = signAdminToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    setAuthCookie(token);

    return NextResponse.json({
      user: { email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while logging in.' },
      { status: 500 }
    );
  }
}
