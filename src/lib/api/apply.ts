import { apiClient } from "./client";
import { Apply } from "@/types/apply";

export async function getApplies(postId: string): Promise<Apply[]> {
    return apiClient(`/api/posts/${postId}/applies`);
}

export async function createApply(postId: string, message: string): Promise<Apply> {
    return apiClient(`/api/posts/${postId}/applies`, {
        method: "POST",
        body: { message },
    });
}

export async function cancelApply(postId: string): Promise<void> {
    return apiClient(`/api/posts/${postId}/applies`, { method: "DELETE" });
}

export async function approveApply(applyId: string): Promise<Apply> {
    return apiClient(`/api/applies/${applyId}/approve`, { method: "PATCH" });
}

export async function rejectApply(applyId: string): Promise<Apply> {
    return apiClient(`/api/applies/${applyId}/reject`, { method: "PATCH" });
}
