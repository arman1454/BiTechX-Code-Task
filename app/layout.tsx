import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
// footer uses a plain anchor to avoid underline behavior from the Link component
import clsx from "clsx";

import { HeroProviders } from "./HeroProviders";
import { LoadingProvider } from "@/components/LoadingProvider";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { ReduxProviders } from "./ReduxProviders";
import TokenInitializer from "@/components/TokenInitializer";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ReduxProviders>
          <TokenInitializer />
          <LoadingProvider>
            <HeroProviders
              themeProps={{ attribute: "class", forcedTheme: "light" }}
            >
              <div className="relative flex flex-col h-screen">
                <main className="container mx-auto max-w-7xl py-2 px-6 flex-grow">
                  {children}
                </main>
                <footer className="w-full flex items-center justify-center py-3">
                  <a
                    className="flex items-center gap-1 text-current"
                    href="https://heroui.com?utm_source=next-app-template"
                    title="heroui.com homepage"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <span className="text-default-600">BiTechX</span>
                    <p className="text-primary">Code Task</p>
                  </a>
                </footer>
              </div>
            </HeroProviders>
          </LoadingProvider>
        </ReduxProviders>
      </body>
    </html>
  );
}
