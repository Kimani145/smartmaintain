import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedRoute = [
    '/dashboard',
    '/admin',
    '/manager',
    '/tenant',
    '/technician',
    '/notifications',
    '/report',
    '/protected',
  ].some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Check for banned user globally and enforce dashboard role boundaries
  if (user && !request.nextUrl.pathname.startsWith('/banned') && !request.nextUrl.pathname.startsWith('/auth')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_banned, role, email')
      .eq('id', user.id)
      .single()

    if (profile?.is_banned) {
      const url = request.nextUrl.clone()
      url.pathname = '/banned'
      return NextResponse.redirect(url)
    }

    const role = resolveUserRole(profile)
    const pathname = request.nextUrl.pathname

    if (pathname.startsWith('/dashboard')) {
      if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = `/dashboard/${role}`
        return NextResponse.redirect(url)
      }
      if (pathname.startsWith('/dashboard/manager') && role !== 'manager' && role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = `/dashboard/${role}`
        return NextResponse.redirect(url)
      }
      if (pathname.startsWith('/dashboard/technician') && role !== 'technician' && role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = `/dashboard/${role}`
        return NextResponse.redirect(url)
      }
      // Tenants can only access /dashboard/tenant, but we don't strictly block them from /dashboard 
      // since /dashboard redirects them anyway.
    }
    
    // Also protect non-dashboard top-level routes
    if (pathname.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${role}`
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/manager') && role !== 'manager' && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${role}`
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/technician') && role !== 'technician' && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${role}`
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/tenant') && role !== 'tenant') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${role}`
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

/**
 * Canonical role resolver — the single source of truth for all role decisions.
 *
 * Pass the full profile (or null when it is missing).  Callers should NEVER
 * duplicate this logic; always import from here.
 *
 * Accepts null so callers don't need to guard before calling.
 */
export function resolveUserRole(
  profile: { role: string; email: string } | null | undefined,
): 'admin' | 'manager' | 'tenant' | 'technician' {
  if (!profile) return 'tenant'
  const role = profile.role as string
  // Keep technician as a valid resolved role even though the enum was removed
  // from the DB — the /dashboard/technician route still exists.
  if (role === 'admin' || role === 'manager' || role === 'technician' || role === 'tenant') {
    return role as 'admin' | 'manager' | 'tenant' | 'technician'
  }
  return 'tenant'
}

/**
 * @deprecated Use resolveUserRole() instead.
 * Kept for backwards-compatibility with existing imports.
 */
export function getVirtualRole(
  profile: { role: string; email: string } | null | undefined,
): string {
  return resolveUserRole(profile)
}
