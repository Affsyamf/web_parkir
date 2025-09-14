import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import SessionProvider from '@/components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ParkWise - Solusi Parkir Cerdas',
  description: 'Aplikasi booking dan monitoring lahan parkir modern.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* PERUBAHAN UTAMA DI SINI:
        - Menambahkan kelas warna dan transisi langsung ke tag <body>.
        - Ini memastikan seluruh halaman merespons perubahan tema.
      */}
      <body 
        className={`${inter.className} bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        <ThemeProvider 
          attribute="class"
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

