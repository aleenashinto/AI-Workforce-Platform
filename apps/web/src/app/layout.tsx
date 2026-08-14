import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Workforce Platform',
  description: 'AI Customer Support and Sales Assistants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
