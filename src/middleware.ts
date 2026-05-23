import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If environment variables are not available, skip Supabase operations
    if (!supabaseUrl || !supabaseAnonKey) {
        // For admin routes, redirect to login if no session cookie exists
        const { pathname } = request.nextUrl
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
            const hasSessionCookie = request.cookies.get('auth-token') || request.cookies.get('sb-access-token')
            if (!hasSessionCookie) {
                const url = request.nextUrl.clone()
                url.pathname = '/admin/login'
                return NextResponse.redirect(url)
            }
        }
        return supabaseResponse
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh the session if it's expired or about to expire
    // This will also set the session in the response
    await supabase.auth.getSession()

    // Check if the user is trying to access admin routes
    const { pathname } = request.nextUrl

    // Allow public access to login page
    if (pathname === '/admin/login') {
        return supabaseResponse
    }

    // For all other admin routes, check authentication
    if (pathname.startsWith('/admin')) {
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
            // Redirect to login page if not authenticated
            const url = request.nextUrl.clone()
            url.pathname = '/admin/login'
            return NextResponse.redirect(url)
        }
    }

    // Return the response with any updated cookies
    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}