import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpsVault | Production DevOps & SRE Scripts Hub",
  description: "Curated, production-hardened automation scripts for DevOps, SRE, Platform Ops, and Support engineers. Complete with beginner-friendly guides and safe Docker sandboxes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#090d16] text-slate-100 min-h-screen selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
