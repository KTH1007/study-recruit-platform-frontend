import { apiClient } from "./client";
import { Comment } from "@/types/comment";
import { PageResponse } from "@/types/api";

export async function getComments(postId: string, page = 0): Promise<PageResponse<Comment>> {
    return apiClient(`/api/posts/${postId}/comments?page=${page}&size=20&sort=createdAt,asc`);
}

export async function createComment(postId: string, content: string): Promise<Comment> {
    return apiClient(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: { content },
    });
}

export async function updateComment(postId: string, commentId: string, content: string): Promise<Comment> {
    return apiClient(`/api/posts/${postId}/comments/${commentId}`, {
        method: "PATCH",
        body: { content },
    });
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
    return apiClient(`/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
}
