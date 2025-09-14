import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Parkirin - Dashboard',
  description: 'Aplikasi booking dan monitoring lahan parkir modern.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          {children}
          {/* Memindahkan Toaster ke root layout agar konsisten */}
          <Toaster 
            position="top-right"
            toastOptions={{
              success: { style: { background: '#dcfce7', color: '#166534', border: '1px solid #4ade80' } },
              error: { style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' } },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}

