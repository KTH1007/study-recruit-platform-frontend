"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/api/token";

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!getAccessToken());
    }, []);

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
                <Link href="/posts" className="text-lg font-bold tracking-tight text-indigo-600">
                    StudyMeet
                </Link>
                <nav className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <Link
                            href="/posts/new"
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                        >
                            글쓰기
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                        >
                            로그인
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
