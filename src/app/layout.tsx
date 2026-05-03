import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { AuthBootstrap } from '@/components/shared/AuthBootstrap';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/config/site';
import { QueryProvider } from '@/lib/query-provider';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <AuthBootstrap />
            {children}
            <Toaster />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
