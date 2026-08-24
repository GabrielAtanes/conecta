import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conecta",
  description: "Crie conexões através de jogos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
