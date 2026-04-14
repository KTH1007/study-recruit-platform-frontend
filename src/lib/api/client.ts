import { getAccessToken, removeAccessToken, setAccessToken } from "./token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestOptions = {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
};

export async function apiClient<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const accessToken = getAccessToken();

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
    });

    if (response.status === 401) {
        const refreshed = await reissueToken();
        if (refreshed) {
            return apiClient<T>(endpoint, options);
        }
        removeAccessToken();
        window.location.href = "/login";
        throw new Error("인증이 만료되었습니다.");
    }

    if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
    }

    const text = await response.text();
    if (!text) return null as T;
    const json = JSON.parse(text);
    return json.data !== undefined ? json.data : json;
}

async function reissueToken(): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/auth/reissue`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) return false;

    const data = await response.json();
    setAccessToken(data.accessToken);
    return true;
}