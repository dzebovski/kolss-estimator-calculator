import type { Metadata } from "next";
import "@/lib/config/init";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Kolss Estimator Calculator",
    template: "%s | Kolss Estimator Calculator",
  },
  description: "Calculate your project estimates with the Kolss Estimator.",
  applicationName: "Kolss Estimator",
  category: "calculator",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Kolss Estimator Calculator",
    description: "Calculate your project estimates with the Kolss Estimator.",
    url: "/",
    siteName: "Kolss Estimator",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kolss Estimator Calculator",
    description: "Calculate your project estimates with the Kolss Estimator.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kolss Estimator Calculator",
    url: baseUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    description: "Calculate your project estimates with the Kolss Estimator.",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
