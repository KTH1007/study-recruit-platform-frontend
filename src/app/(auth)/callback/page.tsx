"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccessToken } from "@/lib/api/token";

function CallbackHandler() {
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

export default function CallbackPage() {
    return (
        <Suspense>
            <CallbackHandler />
        </Suspense>
    );
}
