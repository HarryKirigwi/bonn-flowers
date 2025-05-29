import jwt from 'jsonwebtoken';

export function authenticateToken(req) {
  // Try Authorization header first
  const authHeader = req.headers.get('authorization');
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  // If not found, try cookies
  if (!token) {
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      // Look for token=... in the cookie string
      const match = cookieHeader.match(/(?:^|; )token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function isAdmin(user) {
  return user && user.role === 'admin';
}
