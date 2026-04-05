import type { Metadata } from "next";
import "./globals.css";
import { Inter, Instrument_Serif } from "next/font/google";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: '400', variable: '--font-instrument-serif' });

export const metadata: Metadata = {
  title: "hackappv2",
  description: "Minimal Next.js starter with Drizzle, Better Auth, shadcn/ui, Motion, and Zustand.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, instrumentSerif.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
