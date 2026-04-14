"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPosts } from "@/lib/api/post";
import { PostSummary, PostListParams, StudyPostStatus } from "@/types/post";
import { PageResponse } from "@/types/api";

const TECH_STACKS = ["Java", "Spring", "React", "Next.js", "TypeScript", "Python", "Node.js", "Kotlin", "Go"];

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

export default function PostsPage() {
    const router = useRouter();
    const [data, setData] = useState<PageResponse<PostSummary> | null>(null);
    const [params, setParams] = useState<PostListParams>({ page: 0, size: 10 });
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        getPosts(params).then(setData).catch(console.error);
    }, [params]);

    const handleSearch = () => {
        setParams((prev) => ({ ...prev, page: 0 }));
    };

    const handleTechStack = (stack: string) => {
        setParams((prev) => ({
            ...prev,
            techStack: prev.techStack === stack ? undefined : stack,
            page: 0,
        }));
    };

    const handleStatus = (status: StudyPostStatus) => {
        setParams((prev) => ({
            ...prev,
            status: prev.status === status ? undefined : status,
            page: 0,
        }));
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            {/* 검색 */}
            <div className="mb-6 flex gap-2">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="스터디 키워드 검색"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                    onClick={handleSearch}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                >
                    검색
                </button>
            </div>

            {/* 기술스택 필터 */}
            <div className="mb-3 flex flex-wrap gap-2">
                {TECH_STACKS.map((stack) => (
                    <button
                        key={stack}
                        onClick={() => handleTechStack(stack)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            params.techStack === stack
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                        }`}
                    >
                        {stack}
                    </button>
                ))}
            </div>

            {/* 모집상태 필터 */}
            <div className="mb-6 flex gap-2">
                {(["OPEN", "CLOSED", "FULL"] as StudyPostStatus[]).map((status) => (
                    <button
                        key={status}
                        onClick={() => handleStatus(status)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            params.status === status
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                        }`}
                    >
                        {statusLabel[status]}
                    </button>
                ))}
            </div>

            {/* 게시글 목록 */}
            <div className="flex flex-col gap-3">
                {data?.content.length === 0 && (
                    <p className="py-16 text-center text-sm text-slate-400">게시글이 없습니다.</p>
                )}
                {data?.content.map((post) => (
                    <div
                        key={post.id}
                        onClick={() => router.push(`/posts/${post.id}`)}
                        className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                    >
                        <div className="mb-3 flex items-start justify-between gap-2">
                            <h2 className="font-semibold text-slate-900 transition group-hover:text-indigo-600">
                                {post.title}
                            </h2>
                            <span
                                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle[post.status]}`}
                            >
                                {statusLabel[post.status]}
                            </span>
                        </div>
                        <div className="mb-3 flex flex-wrap gap-1.5">
                            {post.techStack?.split(",").map((stack) => (
                                <span
                                    key={stack}
                                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                                >
                                    {stack.trim()}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>{post.authorNickname}</span>
                            <span>·</span>
                            <span>최대 {post.maxMembers}명</span>
                            <span>·</span>
                            <span>마감 {post.deadline?.slice(0, 10)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 페이지네이션 */}
            {data && data.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                        disabled={params.page === 0}
                        onClick={() => setParams((prev) => ({ ...prev, page: (prev.page ?? 0) - 1 }))}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
                    >
                        이전
                    </button>
                    <span className="px-3 text-sm text-slate-500">
                        {(params.page ?? 0) + 1} / {data.totalPages}
                    </span>
                    <button
                        disabled={data.last}
                        onClick={() => setParams((prev) => ({ ...prev, page: (prev.page ?? 0) + 1 }))}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
}
