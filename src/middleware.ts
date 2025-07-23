import { NextResponse, NextRequest } from 'next/server'
import connectDB from "@/db/index";

connectDB();
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicPath = path === '/auth/login' || path === '/auth/register' || path === '/auth/forgot-password';
    
    const accessToken = request.cookies.get('accessToken')?.value || '';
    if(!accessToken && !isPublicPath) {
        return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
    }else if(accessToken && isPublicPath) {
        return NextResponse.redirect(new URL('/users/me', request.nextUrl));
    }
    return NextResponse.next();
}
 
export const config = {
  matcher: ['/','/users/:path*','/auth/:path*'],
}