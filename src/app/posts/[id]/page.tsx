"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPost, deletePost } from "@/lib/api/post";
import { getApplies, createApply, cancelApply, approveApply, rejectApply } from "@/lib/api/apply";
import { getComments, createComment, updateComment, deleteComment } from "@/lib/api/comment";
import { getTeamByPostId } from "@/lib/api/team";
import { getCurrentUserId } from "@/lib/api/token";
import { Post, StudyPostStatus } from "@/types/post";
import { Apply } from "@/types/apply";
import { Comment } from "@/types/comment";
import { StudyTeam } from "@/types/team";

const statusLabel: Record<StudyPostStatus, string> = {
    OPEN: "모집 중",
    CLOSED: "마감",
    FULL: "정원 초과",
};

const statusStyle: Record<StudyPostStatus, string> = {
    OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
    FULL: "bg-amber-50 text-amber-700 border-amber-200",
};

const applyStatusLabel: Record<string, string> = {
    PENDING: "검토중",
    APPROVED: "승인",
    REJECTED: "거절",
};

const applyStatusStyle: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-200",
    REJECTED: "bg-red-50 text-red-500 border-red-200",
};

// @닉네임을 파란색으로 하이라이트
function renderWithMentions(content: string) {
    const parts = content.split(/(@\S+)/g);
    return parts.map((part, i) =>
        /^@\S+$/.test(part) ? (
            <span key={i} className="font-medium text-indigo-500">
                {part}
            </span>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}

// 댓글 입력창 with 멘션 자동완성
function CommentInput({
    value,
    onChange,
    onSubmit,
    disabled,
    availableNicknames,
}: {
    value: string;
    onChange: (v: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    disabled: boolean;
    availableNicknames: string[];
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [mentionNicknames, setMentionNicknames] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const getMentionMatch = (text: string, cursor: number) => {
        const before = text.slice(0, cursor);
        const match = before.match(/@(\S*)$/);
        return match ? { query: match[1], start: match.index! } : null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);
        const cursor = e.target.selectionStart ?? val.length;
        const match = getMentionMatch(val, cursor);
        if (match) {
            const filtered = availableNicknames.filter((n) =>
                n.toLowerCase().startsWith(match.query.toLowerCase())
            );
            setMentionNicknames(filtered);
            setShowDropdown(filtered.length > 0);
            setActiveIndex(0);
        } else {
            setShowDropdown(false);
        }
    };

    const selectMention = (nickname: string) => {
        const input = inputRef.current;
        if (!input) return;
        const cursor = input.selectionStart ?? value.length;
        const match = getMentionMatch(value, cursor);
        if (!match) return;
        const before = value.slice(0, match.start);
        const after = value.slice(cursor);
        const newVal = `${before}@${nickname} ${after}`;
        onChange(newVal);
        setShowDropdown(false);
        // 커서를 멘션 뒤로 이동
        setTimeout(() => {
            const pos = before.length + nickname.length + 2;
            input.setSelectionRange(pos, pos);
            input.focus();
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, mentionNicknames.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            selectMention(mentionNicknames[activeIndex]);
        } else if (e.key === "Escape") {
            setShowDropdown(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="relative flex gap-2">
            <div className="relative flex-1">
                <input
                    ref={inputRef}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    placeholder="댓글을 입력하세요. @닉네임으로 멘션할 수 있어요"
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                />
                {showDropdown && (
                    <ul className="absolute bottom-full left-0 z-20 mb-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        {mentionNicknames.map((nick, i) => (
                            <li
                                key={nick}
                                onMouseDown={() => selectMention(nick)}
                                className={`cursor-pointer px-4 py-2 text-sm transition ${
                                    i === activeIndex
                                        ? "bg-indigo-50 text-indigo-700 font-medium"
                                        : "text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                @{nick}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button
                type="submit"
                disabled={disabled || !value.trim()}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
                등록
            </button>
        </form>
    );
}

export default function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [team, setTeam] = useState<StudyTeam | null>(null);
    const [applies, setApplies] = useState<Apply[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [applyMessage, setApplyMessage] = useState("");
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const isAuthor = post?.authorId === currentUserId;
    const isLoggedIn = !!currentUserId;

    // 자동완성용 닉네임: 게시글 작성자 + 댓글 작성자들 (중복 제거)
    const availableNicknames = Array.from(
        new Set([
            ...(post?.authorNickname ? [post.authorNickname] : []),
            ...comments.map((c) => c.authorNickname),
        ])
    );

    useEffect(() => {
        setCurrentUserId(getCurrentUserId());
        getPost(id).then(setPost).catch(console.error);
        getComments(id).then((res) => setComments(res.content)).catch(console.error);
        getTeamByPostId(id).then(setTeam).catch(() => setTeam(null));
    }, [id]);

    useEffect(() => {
        if (isAuthor) {
            getApplies(id).then(setApplies).catch(console.error);
        }
    }, [id, isAuthor]);

    const handleDelete = async () => {
        if (!confirm("게시글을 삭제하시겠습니까?")) return;
        await deletePost(id);
        router.push("/posts");
    };

    const handleApply = async () => {
        setSubmitting(true);
        try {
            await createApply(id, applyMessage);
            setShowApplyModal(false);
            setApplyMessage("");
            alert("지원이 완료되었습니다.");
        } catch {
            alert("지원에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelApply = async () => {
        if (!confirm("지원을 취소하시겠습니까?")) return;
        await cancelApply(id);
        alert("지원이 취소되었습니다.");
    };

    const handleApprove = async (applyId: string) => {
        const updated = await approveApply(applyId);
        setApplies((prev) => prev.map((a) => (a.id === applyId ? updated : a)));
    };

    const handleReject = async (applyId: string) => {
        const updated = await rejectApply(applyId);
        setApplies((prev) => prev.map((a) => (a.id === applyId ? updated : a)));
    };

    const handleCreateComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;
        setSubmitting(true);
        try {
            const comment = await createComment(id, commentContent.trim());
            setComments((prev) => [...prev, comment]);
            setCommentContent("");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!editingContent.trim()) return;
        const updated = await updateComment(id, commentId, editingContent.trim());
        setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
        setEditingCommentId(null);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("댓글을 삭제하시겠습니까?")) return;
        await deleteComment(id, commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
    };

    if (!post) return null;

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-700"
            >
                ← 목록으로
            </button>

            {/* 게시글 본문 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle[post.status]}`}>
                        {statusLabel[post.status]}
                    </span>
                    <span className="text-xs text-slate-400">최대 {post.maxMembers}명</span>
                </div>

                <h1 className="mb-3 text-2xl font-bold text-slate-900">{post.title}</h1>

                <div className="mb-5 flex items-center gap-3 text-sm text-slate-400">
                    <span>{post.authorNickname}</span>
                    <span>·</span>
                    <span>마감 {post.deadline?.slice(0, 10)}</span>
                    <span>·</span>
                    <span>{post.createdAt?.slice(0, 10)} 작성</span>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                    {post.techStack?.split(",").map((stack) => (
                        <span
                            key={stack}
                            className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600"
                        >
                            {stack.trim()}
                        </span>
                    ))}
                </div>

                <div className="mb-8 border-t border-slate-100 pt-6">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.description}</p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {isAuthor && (
                            <>
                                <button
                                    onClick={() => router.push(`/posts/${id}/edit`)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                                >
                                    수정
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="rounded-lg border border-red-100 px-4 py-2 text-sm text-red-500 transition hover:bg-red-50"
                                >
                                    삭제
                                </button>
                            </>
                        )}
                        {team && (
                            <button
                                onClick={() => router.push(`/teams/${team.id}`)}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                팀 채팅방
                            </button>
                        )}
                    </div>
                    {isLoggedIn && !isAuthor && post.status === "OPEN" && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowApplyModal(true)}
                                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                            >
                                지원하기
                            </button>
                            <button
                                onClick={handleCancelApply}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-50"
                            >
                                지원 취소
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 지원자 목록 (작성자만) */}
            {isAuthor && applies.length > 0 && (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold text-slate-800">
                        지원자 목록 <span className="text-sm font-normal text-slate-400">({applies.length}명)</span>
                    </h2>
                    <div className="flex flex-col gap-3">
                        {applies.map((apply) => (
                            <div
                                key={apply.id}
                                className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                            >
                                <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-800">{apply.applicantNickname}</span>
                                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${applyStatusStyle[apply.status]}`}>
                                            {applyStatusLabel[apply.status]}
                                        </span>
                                    </div>
                                    {apply.applicantTechStack && (
                                        <p className="mb-1 text-xs text-slate-400">{apply.applicantTechStack}</p>
                                    )}
                                    {apply.message && (
                                        <p className="text-sm text-slate-600">{apply.message}</p>
                                    )}
                                </div>
                                {apply.status === "PENDING" && (
                                    <div className="ml-4 flex gap-2">
                                        <button
                                            onClick={() => handleApprove(apply.id)}
                                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
                                        >
                                            승인
                                        </button>
                                        <button
                                            onClick={() => handleReject(apply.id)}
                                            className="rounded-lg border border-red-100 px-3 py-1.5 text-xs text-red-500 transition hover:bg-red-50"
                                        >
                                            거절
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 댓글 섹션 */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-800">
                    댓글 <span className="text-sm font-normal text-slate-400">({comments.length})</span>
                </h2>

                <div className="mb-6 flex flex-col gap-4">
                    {comments.length === 0 && (
                        <p className="py-6 text-center text-sm text-slate-400">첫 댓글을 남겨보세요</p>
                    )}
                    {comments.map((comment) => (
                        <div key={comment.id} className="border-b border-slate-100 pb-4 last:border-0">
                            <div className="mb-1.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-700">{comment.authorNickname}</span>
                                    <span className="text-xs text-slate-400">{comment.createdAt?.slice(0, 10)}</span>
                                </div>
                                {comment.authorId === currentUserId && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingCommentId(comment.id);
                                                setEditingContent(comment.content);
                                            }}
                                            className="text-xs text-slate-400 hover:text-slate-600"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-xs text-red-400 hover:text-red-600"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                            {editingCommentId === comment.id ? (
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleUpdateComment(comment.id)}
                                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                                    >
                                        저장
                                    </button>
                                    <button
                                        onClick={() => setEditingCommentId(null)}
                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
                                    >
                                        취소
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-600">{renderWithMentions(comment.content)}</p>
                            )}
                        </div>
                    ))}
                </div>

                {isLoggedIn ? (
                    <CommentInput
                        value={commentContent}
                        onChange={setCommentContent}
                        onSubmit={handleCreateComment}
                        disabled={submitting}
                        availableNicknames={availableNicknames}
                    />
                ) : (
                    <p className="text-center text-sm text-slate-400">
                        댓글을 남기려면{" "}
                        <button onClick={() => router.push("/login")} className="text-indigo-600 hover:underline">
                            로그인
                        </button>
                        이 필요합니다.
                    </p>
                )}
            </div>

            {/* 지원하기 모달 */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-lg font-semibold text-slate-800">스터디 지원하기</h2>
                        <textarea
                            value={applyMessage}
                            onChange={(e) => setApplyMessage(e.target.value)}
                            rows={5}
                            maxLength={500}
                            placeholder="지원 메시지를 입력해주세요 (선택사항, 최대 500자)"
                            className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowApplyModal(false)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={submitting}
                                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {submitting ? "지원 중..." : "지원하기"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
