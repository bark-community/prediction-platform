import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { UiLayout } from "@/components/ui/ui-layout";
import { SolanaProvider } from "@/providers/solana-provider";
import { ClusterProvider } from "@/components/cluster/cluster-data-access";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { Toaster } from "@/components/ui/sonner";
import { FaTwitter, FaDiscord, FaGithub } from 'react-icons/fa';
import Head from 'next/head';
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BARK",
  description: "Prediction Platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Head>
        <html lang="en" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={metadata.description} />
        <title>{metadata.title}</title>
      </Head>
      <body className={cn("flex flex-col min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <div className="flex-grow">
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
        </div>
        {/* Footer */}
        <footer className="text-center py-4 text-xs text-gray-500 bg-background">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-4">
              {/* GitHub */}
              <a href="https://github.com/bark-community/prediction-platform" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700"><FaGithub /> GitHub</a>
              {/* Discord */}
              <a href="https://discord.gg/H9en8eHzn2" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700"><FaDiscord /> Discord</a>
              {/* Twitter */}
              <a href="https://x.com/bark_protocol" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700"><FaTwitter /> Twitter</a>
            </div>
            <p>&copy; {new Date().getFullYear()} BARK Protocol. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </>
  );
}
