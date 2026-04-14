"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/api/notification";
import { Notification } from "@/types/notification";
import { getAccessToken } from "@/lib/api/token";
import { useNotification } from "@/context/NotificationContext";

const typeLabel: Record<string, string> = {
    COMMENT_CREATED: "댓글",
    MENTION: "멘션",
    APPLY_RECEIVED: "지원",
    APPLY_APPROVED: "지원 승인",
    APPLY_REJECTED: "지원 거절",
    POST_DEADLINE: "마감 임박",
    SCHEDULE_CREATED: "일정 등록",
    SCHEDULE_REMINDER: "일정 알림",
};

const typeStyle: Record<string, string> = {
    COMMENT_CREATED: "bg-blue-50 text-blue-600",
    MENTION: "bg-purple-50 text-purple-600",
    APPLY_RECEIVED: "bg-indigo-50 text-indigo-600",
    APPLY_APPROVED: "bg-emerald-50 text-emerald-600",
    APPLY_REJECTED: "bg-red-50 text-red-500",
    POST_DEADLINE: "bg-amber-50 text-amber-600",
    SCHEDULE_CREATED: "bg-teal-50 text-teal-600",
    SCHEDULE_REMINDER: "bg-orange-50 text-orange-600",
};

export default function NotificationsPage() {
    const router = useRouter();
    const { refreshUnreadCount } = useNotification();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!getAccessToken()) {
            router.push("/login");
            return;
        }
        getNotifications()
            .then((res) => setNotifications(res.content))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [router]);

    const handleClickNotification = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
            );
            refreshUnreadCount();
        }
        if (notification.targetId) {
            router.push(`/posts/${notification.targetId}`);
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        refreshUnreadCount();
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    if (loading) return null;

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900">
                    알림
                    {unreadCount > 0 && (
                        <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                            {unreadCount}
                        </span>
                    )}
                </h1>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-indigo-600 hover:underline"
                    >
                        모두 읽음 처리
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                    알림이 없습니다.
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => handleClickNotification(notification)}
                            className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition hover:shadow-sm ${
                                notification.isRead
                                    ? "border-slate-100 bg-white"
                                    : "border-indigo-100 bg-indigo-50/40"
                            }`}
                        >
                            <span
                                className={`mt-0.5 shrink-0 rounded-lg px-2 py-1 text-xs font-medium ${typeStyle[notification.type] ?? "bg-slate-100 text-slate-500"}`}
                            >
                                {typeLabel[notification.type] ?? notification.type}
                            </span>
                            <div className="flex-1">
                                <p className={`text-sm ${notification.isRead ? "text-slate-500" : "font-medium text-slate-800"}`}>
                                    {notification.message}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    {notification.createdAt?.slice(0, 16).replace("T", " ")}
                                </p>
                            </div>
                            {!notification.isRead && (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
