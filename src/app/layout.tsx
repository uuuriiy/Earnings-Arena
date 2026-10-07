import type { Metadata } from "next";
import { fontDisplay, fontMono, fontSans } from "@/shared/lib/fonts";
import { QueryProvider } from "@/context/QueryProvider";
import { PrivyProvider } from "@/context/PrivyProvider";
import { SiteHeader } from "@/features/home/components/SiteHeader";
import { cn } from "@/shared/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "Earnings Arena",
  description: "Memecoins duel on penny-stock earnings. Bigger reaction wins the pot.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(fontDisplay.variable, fontSans.variable, fontMono.variable)}
    >
      <body className={cn(fontSans.className, "antialiased")}>
        <QueryProvider>
          <PrivyProvider>
            <div className="min-h-dvh">
              <SiteHeader />
              <main className="mx-auto max-w-[1100px] p-6">{children}</main>
            </div>
          </PrivyProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
