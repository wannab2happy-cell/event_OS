/**
 * Next.js Middleware for Route Protection
 * 
 * Protects /admin, /staff, and /vendor routes based on user roles
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserWithRole, hasRole, type AppRole } from '@/lib/auth/roles';

/**
 * Route protection configuration
 */
const ROUTE_PROTECTION: Record<string, AppRole[]> = {
  '/admin': ['super_admin', 'event_manager'],
  '/staff': ['super_admin', 'event_manager', 'operations_staff'],
  '/vendor': ['vendor', 'event_manager', 'super_admin'],
};

/**
 * Check if path matches a protected route
 */
function getProtectedRoute(pathname: string): string | null {
  for (const [route, _] of Object.entries(ROUTE_PROTECTION)) {
    if (pathname.startsWith(route)) {
      return route;
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const protectedRoute = getProtectedRoute(pathname);

  if (!protectedRoute) {
    // Not a protected route, allow access
    return NextResponse.next();
  }

  // Get required roles for this route
  const requiredRoles = ROUTE_PROTECTION[protectedRoute];

  // Get current user with role
  const userWithRole = await getCurrentUserWithRole();

  if (!userWithRole) {
    // User not logged in, redirect to login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user has required role
  if (!hasRole(userWithRole.role, requiredRoles)) {
    // User doesn't have required role, redirect to access denied
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  // User has required role, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match protected routes:
     * - /admin/:path*
     * - /staff/:path*
     * - /vendor/:path*
     */
    '/admin/:path*',
    '/staff/:path*',
    '/vendor/:path*',
  ],
};

