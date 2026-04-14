export type StudyPostStatus = "OPEN" | "CLOSED" | "FULL";

export type Post = {
    id: string;
    authorId: string;
    authorNickname: string;
    title: string;
    description: string;
    techStack: string;
    maxMembers: number;
    deadline: string;
    status: StudyPostStatus;
    createdAt: string;
    updatedAt: string;
};

export type PostSummary = {
    id: string;
    authorNickname: string;
    title: string;
    techStack: string;
    maxMembers: number;
    deadline: string;
    status: StudyPostStatus;
    createdAt: string;
};

export type PostListParams = {
    page?: number;
    size?: number;
    techStack?: string;
    status?: StudyPostStatus;
};
