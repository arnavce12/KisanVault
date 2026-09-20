import { Newsreader, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sourcesans',
});

export const metadata = {
  title: 'KisanVault',
  description: 'AI-powered digital farm history platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${sourceSans.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="antialiased font-sourcesans bg-background text-text">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
