import { apiClient } from "./client";
import { Post, PostSummary, PostListParams } from "@/types/post";
import { PageResponse } from "@/types/api";

export async function getPosts(params: PostListParams = {}): Promise<PageResponse<PostSummary>> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.size !== undefined) query.set("size", String(params.size));
    if (params.techStack) query.set("techStack", params.techStack);
    if (params.status) query.set("status", params.status);

    return apiClient(`/api/posts?${query.toString()}`);
}

export async function getPost(id: string): Promise<Post> {
    return apiClient(`/api/posts/${id}`);
}

export async function createPost(body: {
    title: string;
    description: string;
    techStack: string;
    maxMembers: number;
    deadline: string;
}): Promise<Post> {
    return apiClient("/api/posts", { method: "POST", body });
}

export async function updatePost(
    id: string,
    body: {
        title: string;
        description: string;
        techStack: string;
        maxMembers: number;
        deadline: string;
    }
): Promise<Post> {
    return apiClient(`/api/posts/${id}`, { method: "PATCH", body });
}

export async function deletePost(id: string): Promise<void> {
    return apiClient(`/api/posts/${id}`, { method: "DELETE" });
}
