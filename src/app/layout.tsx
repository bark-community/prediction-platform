import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { UiLayout } from "@/components/ui/ui-layout";
import { SolanaProvider } from "@/providers/solana-provider";
import { ClusterProvider } from "@/components/cluster/cluster-data-access";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BARK",
  description: "Prediction Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased px-4 sm:px-6 lg:px-8", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ReactQueryProvider>
            <ClusterProvider>
              <SolanaProvider>
                <UiLayout>{children}</UiLayout>
                <Toaster richColors />
              </SolanaProvider>
            </ClusterProvider>
            <SpeedInsights />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
