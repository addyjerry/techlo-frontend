import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const isEmailMatch = credentials?.email === process.env.ADMIN_EMAIL;
        const isPasswordMatch = credentials?.password === process.env.ADMIN_PASSWORD;

        if (isEmailMatch && isPasswordMatch) {
          return { id: '1', name: 'Admin', email: credentials!.email };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: '/admin-login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };