export type NotificationType =
    | "COMMENT_CREATED"
    | "MENTION"
    | "APPLY_RECEIVED"
    | "APPLY_APPROVED"
    | "APPLY_REJECTED"
    | "POST_DEADLINE"
    | "SCHEDULE_CREATED"
    | "SCHEDULE_REMINDER";

export type Notification = {
    id: string;
    receiverId: string;
    type: NotificationType;
    message: string;
    targetId: string;
    isRead: boolean;
    createdAt: string;
};
