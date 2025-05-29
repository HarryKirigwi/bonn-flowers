import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// JWT Configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  accessTokenExpiry: '1h',
  refreshTokenExpiry: '7d',
};

// Validate JWT secret exists
if (!JWT_CONFIG.secret) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Helper function to generate tokens
const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.accessTokenExpiry,
  });

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.refreshTokenExpiry }
  );

  return { accessToken, refreshToken };
};

// Helper function to validate input
const validateLoginInput = (email, password) => {
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  return errors;
};

export async function POST(req) {
  try {
    // Parse request body with error handling
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

    const { email, password } = body;

    // Validate input
    const validationErrors = validateLoginInput(email, password);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: validationErrors[0],
        errors: validationErrors
      }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        createdAt: true
        // updatedAt: true, // REMOVED because it does not exist in your schema
      }
    });

    if (!user) {
      // Use generic error message to prevent user enumeration
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in database (optional but recommended for security)
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          lastLoginAt: new Date(),
          // You might want to store refresh tokens in a separate table
          // refreshToken: await bcrypt.hash(refreshToken, 10)
        }
      });
    } catch (updateError) {
      console.warn('Failed to update user login timestamp:', updateError);
      // Don't fail the login for this
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Log successful login (optional)
    console.log(`User ${user.email} logged in successfully at ${new Date().toISOString()}`);

    // Return response matching AuthContext expectations
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);

    // Handle specific database errors
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Generic error response
    return NextResponse.json({
      success: false,
      error: 'An error occurred during login. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Optional: Add rate limiting (you'll need to implement this logic)
/*
const rateLimiter = new Map();

const checkRateLimit = (identifier) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!rateLimiter.has(identifier)) {
    rateLimiter.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const attempt = rateLimiter.get(identifier);
  if (now > attempt.resetTime) {
    rateLimiter.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (attempt.count >= maxAttempts) {
    return false;
  }

  attempt.count++;
  return true;
};
*/
