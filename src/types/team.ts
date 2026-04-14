export type TeamMemberRole = "LEADER" | "MEMBER";

export type StudyTeam = {
    id: string;
    postId: string;
    name: string;
};

export type TeamMember = {
    id: string;
    userId: string;
    nickname: string;
    role: TeamMemberRole;
};

export type TeamSchedule = {
    id: string;
    teamId: string;
    title: string;
    description: string | null;
    scheduledAt: string;
    createdAt: string;
};

export type ChatMessage = {
    messageId: string;
    teamId: string;
    senderId: string;
    senderNickname: string;
    content: string;
    createdAt: string;
};
