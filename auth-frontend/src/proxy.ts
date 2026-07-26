import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // We can't access localStorage in Middleware (it runs on the server).
  // In a robust application, you would store the JWT in an HttpOnly cookie 
  // and check it here: `request.cookies.get('token')`.
  
  // For demonstration purposes, we will rely on client-side protection in /dashboard/page.tsx
  // But if you ever switch to cookies, this is where you'd redirect them:
  /*
  const token = request.cookies.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
