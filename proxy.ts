import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es',
  localePrefix: 'always'
});

export default async function middleware(request: NextRequest) {
  // 1. Create a response object that intlMiddleware would return
  let response = intlMiddleware(request);

  // 2. Setup Supabase client in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          // Refresh the response if cookies are set
          response = intlMiddleware(request);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  );

  // 3. Get user session
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  
  // Extract locale and path without locale
  const segments = pathname.split('/');
  const locale = segments[1] || 'es';
  const pathWithoutLocale = segments.slice(2).join('/');

  // 4. Redirection logic
  if (user) {
    // If logged in and trying to access auth pages, redirect to dashboard
    if (pathWithoutLocale === '' || pathWithoutLocale === 'login' || pathWithoutLocale === 'register') {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  } else {
    // If not logged in and trying to access app pages, redirect to login
    const publicPaths = ['login', 'register'];
    const isPublic = publicPaths.some(path => pathWithoutLocale.startsWith(path));
    
    if (!isPublic) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames and exclude internal Next.js paths and API routes
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
