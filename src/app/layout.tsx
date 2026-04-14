import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "스터디 모집 플랫폼",
    description: "스터디원을 모집하고 함께 성장하세요",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" className={`${inter.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
                <Header />
                <main className="flex-1">{children}</main>
            </body>
        </html>
    );
}
