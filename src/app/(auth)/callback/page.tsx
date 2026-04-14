"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccessToken } from "@/lib/api/token";

export default function CallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");

        if (accessToken) {
            setAccessToken(accessToken);
            router.replace("/posts");
        } else {
            router.replace("/login");
        }
    }, [searchParams, router]);

    return null;
}