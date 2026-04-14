import { apiClient } from "./client";
import { Notification } from "@/types/notification";
import { PageResponse } from "@/types/api";

export async function getNotifications(page = 0): Promise<PageResponse<Notification>> {
    return apiClient(`/api/notifications?page=${page}&size=20`);
}

export async function getUnreadCount(): Promise<number> {
    return apiClient("/api/notifications/unread-count");
}

export async function markAsRead(notificationId: string): Promise<void> {
    return apiClient(`/api/notifications/${notificationId}/read`, { method: "PATCH" });
}

export async function markAllAsRead(): Promise<void> {
    return apiClient("/api/notifications/read-all", { method: "PATCH" });
}
