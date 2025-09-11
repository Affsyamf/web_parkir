import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ParkWise - Solusi Parkir Cerdas',
  description: 'Aplikasi booking dan monitoring lahan parkir modern.',
};

export default function RootLayout({ children }) {
  return (
    // Menambahkan suppressHydrationWarning untuk menghilangkan error di console
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

