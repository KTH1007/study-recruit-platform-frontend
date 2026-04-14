const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getCurrentUserId(): string | null {
    const token = getAccessToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        return payload.userId ?? null;
    } catch {
        return null;
    }
}