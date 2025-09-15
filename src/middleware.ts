import { NextResponse, NextRequest } from 'next/server'



// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    
    // Define public paths
    const isPublicPath = path === '/auth/login' || 
                         path === '/auth/signup' || 
                         path === '/auth/forgot-password' || 
                         path === '/auth/reset-password' || 
                         path === '/';
    
    const accessToken = request.cookies.get('accessToken')?.value || '';
    
    // If trying to access protected path without token
    if (!isPublicPath && !accessToken) {
        return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
    }
    
    // If trying to access public path with token (already logged in)
    if (isPublicPath && accessToken) {
        return NextResponse.redirect(new URL('/home', request.nextUrl)); // or wherever you want to redirect
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/home/:path*',
        '/users/:path*',
        '/auth/:path*',
        '/my-classroom/:path*',
        '/practices/:path*',
        '/courses/:path*'

    ],
}