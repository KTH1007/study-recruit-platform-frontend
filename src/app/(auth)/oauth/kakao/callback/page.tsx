"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setAccessToken } from "@/lib/api/token";
import { apiClient } from "@/lib/api/client";

function CallbackHandler() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams.get("code");
        if (!code) {
            window.location.href = "/login";
            return;
        }

        apiClient<{ accessToken: string }>("/api/auth/kakao", {
            method: "POST",
            body: { code },
        })
            .then(({ accessToken }) => {
                setAccessToken(accessToken);
                window.location.href = "/posts";
            })
            .catch(() => {
                window.location.href = "/login";
            });
    }, [searchParams]);

    return null;
}

export default function CallbackPage() {
    return (
        <Suspense>
            <CallbackHandler />
        </Suspense>
    );
}
