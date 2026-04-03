import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { getBackendBaseUrl } from '../../../lib/backend';

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const baseUrl = getBackendBaseUrl()
        const res = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials?.email, password: credentials?.password }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        // data: { access_token }
        // Return a minimal user object expected by NextAuth
        return { id: '1', email: credentials?.email, accessToken: data.access_token };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  debug: process.env.NODE_ENV !== 'production',
  callbacks: {
    async jwt({ token, user }) {
      if (user && (user as any).accessToken) token.accessToken = (user as any).accessToken;
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = (token as any).accessToken;
      return session;
    },
  },
});
