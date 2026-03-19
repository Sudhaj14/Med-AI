import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, specialization, experience, consultationFee } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (!['patient', 'doctor'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user data
    const userData: any = {
      email,
      name,
      role,
      password: hashedPassword,
    };

    // Add doctor-specific fields
    if (role === 'doctor') {
      if (!specialization) {
        return NextResponse.json(
          { error: 'Specialization is required for doctors' },
          { status: 400 }
        );
      }
      userData.specialization = specialization;
      userData.experience = parseInt(experience) || 0;
      userData.consultationFee = parseInt(consultationFee) || 0;
    }

    // Create user
    const user = new User(userData);
    await user.save();

    // Return user without password
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      specialization: user.specialization,
      experience: user.experience,
      consultationFee: user.consultationFee,
    };

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
