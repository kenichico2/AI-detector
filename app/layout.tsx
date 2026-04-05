import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI文章検出ツール",
  description:
    "学生のレポートを段落ごとに分析し、AIが生成した可能性のある部分を検出します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
