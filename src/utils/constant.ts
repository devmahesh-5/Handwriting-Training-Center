const isProduction= process.env.NODE_ENV! == 'production';
export const options = {
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
}//this ensures that cookie is not modifiable from frontend
