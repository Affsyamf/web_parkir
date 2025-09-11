import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const userResult = await query('SELECT * FROM users WHERE email = $1', [credentials.email]);
          const user = userResult.rows[0];

          if (!user) {
            console.log("User not found for email:", credentials.email);
            return null;
          }
          
          // --- PERBAIKAN UTAMA DI SINI ---
          // Kita harus 'await' hasil perbandingan password karena ini proses asynchronous
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordCorrect) {
            console.log("Password incorrect for user:", credentials.email);
            return null;
          }
          
          // Jika user ditemukan dan password benar, kembalikan data user
          // Jangan sertakan password dalam objek yang dikembalikan
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };

        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login', // Arahkan ke login jika ada error
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

