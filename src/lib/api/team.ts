import { apiClient } from "./client";
import { StudyTeam, TeamMember, TeamSchedule, ChatMessage } from "@/types/team";

// Team
export const getTeam = (teamId: string) =>
    apiClient<StudyTeam>(`/api/teams/${teamId}`);

export const getTeamByPostId = (postId: string) =>
    apiClient<StudyTeam>(`/api/posts/${postId}/team`);

export const getTeamMembers = (teamId: string) =>
    apiClient<TeamMember[]>(`/api/teams/${teamId}/members`);

export const delegateLeader = (teamId: string, targetUserId: string) =>
    apiClient<void>(`/api/teams/${teamId}/members/${targetUserId}/delegate`, { method: "PATCH" });

export const removeMember = (teamId: string, targetUserId: string) =>
    apiClient<void>(`/api/teams/${teamId}/members/${targetUserId}`, { method: "DELETE" });

export const leaveTeam = (teamId: string) =>
    apiClient<void>(`/api/teams/${teamId}/members/me`, { method: "DELETE" });

// Schedule
export const getSchedules = (teamId: string) =>
    apiClient<TeamSchedule[]>(`/api/teams/${teamId}/schedules`);

export const createSchedule = (teamId: string, body: { title: string; description?: string; scheduledAt: string }) =>
    apiClient<TeamSchedule>(`/api/teams/${teamId}/schedules`, { method: "POST", body });

export const updateSchedule = (teamId: string, scheduleId: string, body: { title: string; description?: string; scheduledAt: string }) =>
    apiClient<TeamSchedule>(`/api/teams/${teamId}/schedules/${scheduleId}`, { method: "PATCH", body });

export const deleteSchedule = (teamId: string, scheduleId: string) =>
    apiClient<void>(`/api/teams/${teamId}/schedules/${scheduleId}`, { method: "DELETE" });

// Chat history (REST)
export const getChatMessages = (teamId: string, page = 0, size = 30) =>
    apiClient<{ content: ChatMessage[]; hasNext: boolean }>(`/api/teams/${teamId}/chat?page=${page}&size=${size}`);
