import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login', // adjust to your actual login page
  },
});

export const config = {
  matcher: ['/admin/:path*'],
};