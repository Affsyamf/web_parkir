import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/SessionProvider'; // Import provider
import { getServerSession } from 'next-auth'; // Untuk mendapatkan sesi di server
import { icons } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ParkWise - Solusi Parkir Cerdas',
  description: 'Temukan dan pesan tempat parkir Anda dengan mudah.',
};


export default async function RootLayout({ children }) {
  const session = await getServerSession(); // Ambil sesi di server
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Bungkus children dengan SessionProvider */}
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
