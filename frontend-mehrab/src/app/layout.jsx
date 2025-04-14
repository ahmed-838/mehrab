import './globals.css';
import { Inter } from 'next/font/google';
import { ParticipantsProvider } from '@/context/ParticipantsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'محراب | منصة القرآن الكريم',
  description: 'منصة لتحفيظ وتعليم القرآن الكريم عبر الإنترنت',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <ThemeProvider>
          <ParticipantsProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </ParticipantsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 