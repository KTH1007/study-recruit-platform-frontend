"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, removeAccessToken } from "@/lib/api/token";
import { useNotification } from "@/context/NotificationContext";

export default function Header() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { unreadCount } = useNotification();

    useEffect(() => {
        setIsLoggedIn(!!getAccessToken());
    }, []);

    const handleLogout = () => {
        removeAccessToken();
        setIsLoggedIn(false);
        router.push("/");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
                <Link href="/" className="text-lg font-bold tracking-tight text-indigo-600">
                    StudyMeet
                </Link>
                <nav className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/notifications"
                                className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="알림"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </Link>
                            <Link
                                href="/posts/new"
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                            >
                                글쓰기
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                            >
                                로그아웃
                            </button>
                        </>
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
