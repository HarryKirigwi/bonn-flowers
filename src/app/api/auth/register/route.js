import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Add better request parsing with error handling
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }

    const { email, password, name } = body;
    
    // Add detailed validation
    if (!email || !password || !name) {
      return NextResponse.json({ 
        success: false, 
        error: 'All fields are required.',
        received: { email: !!email, password: !!password, name: !!name }
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please enter a valid email address' 
      }, { status: 400 });
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name must be at least 2 characters long' 
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(), // Normalize email
        password: hashedPassword,
        name: name.trim(),
        role: 'customer',
      },
      select: { id: true, email: true, name: true, role: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully, you can now login',
      user
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false, 
        error: 'Email already exists' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Registration failed', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}