import { apiClient } from "./client";
import { removeAccessToken } from "./token";

export async function logout(): Promise<void> {
    await apiClient("/auth/logout", { method: "POST" });
    removeAccessToken();
    window.location.href = "/login";
}