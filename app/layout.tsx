import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/providers/AuthProvider";
import LanguageProvider from "@/components/providers/LanguageProvider";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/server";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s – ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL("https://noumarket.nc"),
  openGraph: {
    siteName: SITE_NAME,
    locale: "fr_FR",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-white text-gray-900">
        <LanguageProvider initialLocale={locale}>
          <AuthProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
