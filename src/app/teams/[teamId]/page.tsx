"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
    getTeam,
    getTeamMembers,
    getChatMessages,
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    delegateLeader,
    removeMember,
    leaveTeam,
} from "@/lib/api/team";
import { getAccessToken, getCurrentUserId } from "@/lib/api/token";
import { StudyTeam, TeamMember, TeamSchedule, ChatMessage } from "@/types/team";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Tab = "chat" | "members" | "schedules";

export default function TeamPage() {
    const { teamId } = useParams<{ teamId: string }>();
    const router = useRouter();
    const currentUserId = getCurrentUserId();

    const [tab, setTab] = useState<Tab>("chat");
    const [team, setTeam] = useState<StudyTeam | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [schedules, setSchedules] = useState<TeamSchedule[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);

    // Chat
    const [input, setInput] = useState("");
    const stompRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Schedule modal
    const [scheduleModal, setScheduleModal] = useState<{
        open: boolean;
        mode: "create" | "edit";
        editing?: TeamSchedule;
    }>({ open: false, mode: "create" });
    const [scheduleForm, setScheduleForm] = useState({ title: "", description: "", scheduledAt: "" });

    const currentMember = members.find((m) => m.userId === currentUserId);
    const isLeader = currentMember?.role === "LEADER";

    // Initial load
    useEffect(() => {
        if (!getAccessToken()) {
            router.push("/login");
            return;
        }
        Promise.all([
            getTeam(teamId),
            getTeamMembers(teamId),
            getChatMessages(teamId),
            getSchedules(teamId),
        ])
            .then(([t, m, chat, s]) => {
                setTeam(t);
                setMembers(m);
                setMessages(chat.content.slice().reverse());
                setSchedules(s);
            })
            .catch(() => router.push("/posts"))
            .finally(() => setLoading(false));
    }, [teamId, router]);

    // Auto scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // STOMP connect
    useEffect(() => {
        const token = getAccessToken();
        if (!token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/chat/${teamId}`, (frame) => {
                    const msg: ChatMessage = JSON.parse(frame.body);
                    setMessages((prev) => [...prev, msg]);
                });
            },
        });

        client.activate();
        stompRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [teamId]);

    const sendMessage = () => {
        const trimmed = input.trim();
        if (!trimmed || !stompRef.current?.connected) return;
        stompRef.current.publish({
            destination: `/app/chat/${teamId}`,
            body: JSON.stringify({ content: trimmed }),
        });
        setInput("");
    };

    // Members
    const handleDelegateLeader = async (targetUserId: string) => {
        if (!confirm("팀장을 위임하시겠습니까?")) return;
        await delegateLeader(teamId, targetUserId);
        const m = await getTeamMembers(teamId);
        setMembers(m);
    };

    const handleRemoveMember = async (targetUserId: string, nickname: string) => {
        if (!confirm(`${nickname}님을 팀에서 내보내시겠습니까?`)) return;
        await removeMember(teamId, targetUserId);
        setMembers((prev) => prev.filter((m) => m.userId !== targetUserId));
    };

    const handleLeaveTeam = async () => {
        if (isLeader) {
            alert("팀장은 먼저 팀장을 위임해야 탈퇴할 수 있습니다.");
            return;
        }
        if (!confirm("팀에서 탈퇴하시겠습니까?")) return;
        await leaveTeam(teamId);
        router.push("/posts");
    };

    // Schedule
    const openCreateSchedule = () => {
        setScheduleForm({ title: "", description: "", scheduledAt: "" });
        setScheduleModal({ open: true, mode: "create" });
    };

    const openEditSchedule = (s: TeamSchedule) => {
        setScheduleForm({
            title: s.title,
            description: s.description ?? "",
            scheduledAt: s.scheduledAt.slice(0, 16),
        });
        setScheduleModal({ open: true, mode: "edit", editing: s });
    };

    const handleScheduleSubmit = async () => {
        const body = {
            title: scheduleForm.title,
            description: scheduleForm.description || undefined,
            scheduledAt: scheduleForm.scheduledAt + ":00",
        };
        if (scheduleModal.mode === "create") {
            await createSchedule(teamId, body);
        } else if (scheduleModal.editing) {
            await updateSchedule(teamId, scheduleModal.editing.id, body);
        }
        const s = await getSchedules(teamId);
        setSchedules(s);
        setScheduleModal({ open: false, mode: "create" });
    };

    const handleDeleteSchedule = async (scheduleId: string) => {
        if (!confirm("일정을 삭제하시겠습니까?")) return;
        await deleteSchedule(teamId, scheduleId);
        setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    };

    const formatDate = useCallback((iso: string) => {
        return iso.slice(0, 16).replace("T", " ");
    }, []);

    if (loading) return null;
    if (!team) return null;

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-400">스터디팀</p>
                    <h1 className="text-xl font-bold text-slate-900">{team.name}</h1>
                </div>
                <button
                    onClick={handleLeaveTeam}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-500 transition hover:bg-red-50"
                >
                    팀 탈퇴
                </button>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1">
                {(["chat", "members", "schedules"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                            tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        {t === "chat" ? "채팅" : t === "members" ? "멤버" : "일정"}
                    </button>
                ))}
            </div>

            {/* Chat Tab */}
            {tab === "chat" && (
                <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden" style={{ height: "60vh" }}>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                        {messages.length === 0 && (
                            <p className="text-center text-sm text-slate-400 mt-8">첫 메시지를 보내보세요!</p>
                        )}
                        {messages.map((msg, i) => {
                            const isMine = msg.senderId === currentUserId;
                            return (
                                <div key={msg.messageId ?? i} className={`flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
                                    {!isMine && (
                                        <span className="text-xs text-slate-400 px-1">{msg.senderNickname}</span>
                                    )}
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm break-words ${
                                            isMine
                                                ? "bg-indigo-600 text-white rounded-br-sm"
                                                : "bg-slate-100 text-slate-800 rounded-bl-sm"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-slate-300 px-1">
                                        {msg.createdAt ? formatDate(msg.createdAt) : ""}
                                    </span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="border-t border-slate-100 p-3 flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                        <button
                            onClick={sendMessage}
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                            전송
                        </button>
                    </div>
                </div>
            )}

            {/* Members Tab */}
            {tab === "members" && (
                <div className="flex flex-col gap-3">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                                    {member.nickname[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{member.nickname}</p>
                                    <span
                                        className={`text-xs font-medium ${
                                            member.role === "LEADER"
                                                ? "text-amber-600"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        {member.role === "LEADER" ? "팀장" : "팀원"}
                                    </span>
                                </div>
                            </div>
                            {isLeader && member.userId !== currentUserId && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDelegateLeader(member.userId)}
                                        className="rounded-lg border border-amber-200 px-3 py-1 text-xs text-amber-600 transition hover:bg-amber-50"
                                    >
                                        팀장 위임
                                    </button>
                                    <button
                                        onClick={() => handleRemoveMember(member.userId, member.nickname)}
                                        className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-500 transition hover:bg-red-50"
                                    >
                                        내보내기
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Schedules Tab */}
            {tab === "schedules" && (
                <div>
                    <div className="mb-4 flex justify-end">
                        <button
                            onClick={openCreateSchedule}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                        >
                            + 일정 추가
                        </button>
                    </div>
                    {schedules.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                            등록된 일정이 없습니다.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {schedules
                                .slice()
                                .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
                                .map((s) => (
                                    <div
                                        key={s.id}
                                        className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4"
                                    >
                                        <div className="flex gap-4 items-start">
                                            <div className="flex-shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-center">
                                                <p className="text-xs text-indigo-400">{s.scheduledAt.slice(5, 7)}/{s.scheduledAt.slice(8, 10)}</p>
                                                <p className="text-sm font-bold text-indigo-600">{s.scheduledAt.slice(11, 16)}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{s.title}</p>
                                                {s.description && (
                                                    <p className="mt-0.5 text-sm text-slate-500">{s.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4 shrink-0">
                                            <button
                                                onClick={() => openEditSchedule(s)}
                                                className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-50"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSchedule(s.id)}
                                                className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-500 transition hover:bg-red-50"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Schedule Modal */}
            {scheduleModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-lg font-bold text-slate-900">
                            {scheduleModal.mode === "create" ? "일정 추가" : "일정 수정"}
                        </h2>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">제목 *</label>
                                <input
                                    value={scheduleForm.title}
                                    onChange={(e) => setScheduleForm((f) => ({ ...f, title: e.target.value }))}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300"
                                    placeholder="일정 제목"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">내용</label>
                                <textarea
                                    value={scheduleForm.description}
                                    onChange={(e) => setScheduleForm((f) => ({ ...f, description: e.target.value }))}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300 resize-none"
                                    rows={3}
                                    placeholder="일정 내용 (선택)"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">날짜 및 시간 *</label>
                                <input
                                    type="datetime-local"
                                    value={scheduleForm.scheduledAt}
                                    onChange={(e) => setScheduleForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300"
                                />
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={() => setScheduleModal({ open: false, mode: "create" })}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleScheduleSubmit}
                                disabled={!scheduleForm.title || !scheduleForm.scheduledAt}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {scheduleModal.mode === "create" ? "추가" : "저장"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
