"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPost, deletePost } from "@/lib/api/post";
import { Post, StudyPostStatus } from "@/types/post";

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

export default function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        getPost(id).then(setPost).catch(console.error);
    }, [id]);

    const handleDelete = async () => {
        if (!confirm("게시글을 삭제하시겠습니까?")) return;
        await deletePost(id);
        router.push("/posts");
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

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                {/* 상태 & 메타 */}
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

                <div className="flex gap-2">
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
                </div>
            </div>
        </div>
    );
}
