import { NextResponse, NextRequest } from 'next/server'



// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    
    const path = request.nextUrl.pathname;
    const isPublicPath = path === '/auth/login' || path === '/auth/signup' || path === '/auth/forgot-password' || path === '/auth/reset-password';
    
    const accessToken = request.cookies.get('accessToken')?.value || '';
    if(!accessToken && !isPublicPath) {
        return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
    }else if(accessToken && isPublicPath) {
        return NextResponse.redirect(new URL('/', request.nextUrl));
    }else{
        return NextResponse.next();
    }

}
 
export const config = {
  matcher: ['/','/users/:path*','/auth/:path*'],
}