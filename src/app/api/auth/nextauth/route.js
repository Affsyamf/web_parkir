import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { query } from '@/lib/db';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // 1. Cari pengguna di database berdasarkan email
          const userResult = await query('SELECT * FROM users WHERE email = $1', [credentials.email]);
          const user = userResult.rows[0];

          if (!user) {
            // Pengguna tidak ditemukan
            return null;
          }

          // 2. Bandingkan password yang diinput dengan hash di database
          const passwordsMatch = await compare(credentials.password, user.password);

          if (!passwordsMatch) {
            // Password tidak cocok
            return null;
          }

          // 3. Jika berhasil, kembalikan data pengguna (tanpa password)
          // Data ini akan disimpan di dalam token sesi (JWT)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Callback ini digunakan untuk menambahkan data custom (seperti role & id) ke token sesi
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Callback ini digunakan untuk membuat data sesi yang bisa diakses di sisi client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Arahkan ke halaman login kustom kita jika pengguna belum terotentikasi
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
