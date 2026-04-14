"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccessToken } from "@/lib/api/token";
import { apiClient } from "@/lib/api/client";

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams.get("code");
        if (!code) {
            router.replace("/login");
            return;
        }

        apiClient<{ accessToken: string }>("/api/auth/kakao", {
            method: "POST",
            body: { code },
        })
            .then(({ accessToken }) => {
                setAccessToken(accessToken);
                router.replace("/posts");
            })
            .catch(() => {
                router.replace("/login");
            });
    }, [searchParams, router]);

    return null;
}

export default function CallbackPage() {
    return (
        <Suspense>
            <CallbackHandler />
        </Suspense>
    );
}
