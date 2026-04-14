export type ApplyStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Apply = {
    id: string;
    applicantNickname: string;
    applicantTechStack: string;
    message: string;
    status: ApplyStatus;
    createdAt: string;
};
