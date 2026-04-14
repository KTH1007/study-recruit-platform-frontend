"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPost, updatePost } from "@/lib/api/post";

const TECH_STACKS = ["Java", "Spring", "React", "Next.js", "TypeScript", "Python", "Node.js", "Kotlin", "Go"];

export default function EditPostPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [form, setForm] = useState({
        title: "",
        description: "",
        techStacks: [] as string[],
        maxMembers: 2,
        deadline: "",
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getPost(id).then((post) => {
            setForm({
                title: post.title,
                description: post.description,
                techStacks: post.techStack ? post.techStack.split(",").map((s) => s.trim()) : [],
                maxMembers: post.maxMembers,
                deadline: post.deadline?.slice(0, 10) ?? "",
            });
        }).catch(console.error);
    }, [id]);

    const toggleTechStack = (stack: string) => {
        setForm((prev) => ({
            ...prev,
            techStacks: prev.techStacks.includes(stack)
                ? prev.techStacks.filter((s) => s !== stack)
                : [...prev.techStacks, stack],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updatePost(id, {
                title: form.title,
                description: form.description,
                techStack: form.techStacks.join(","),
                maxMembers: form.maxMembers,
                deadline: `${form.deadline}T23:59:59`,
            });
            router.push(`/posts/${id}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-8 text-2xl font-bold text-slate-900">게시글 수정</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">제목</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">기술스택</label>
                    <div className="flex flex-wrap gap-2">
                        {TECH_STACKS.map((stack) => (
                            <button
                                key={stack}
                                type="button"
                                onClick={() => toggleTechStack(stack)}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                    form.techStacks.includes(stack)
                                        ? "border-indigo-600 bg-indigo-600 text-white"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                                }`}
                            >
                                {stack}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">최대 인원</label>
                        <input
                            type="number"
                            min={2}
                            max={20}
                            value={form.maxMembers}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, maxMembers: Number(e.target.value) }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">마감일</label>
                        <input
                            type="date"
                            value={form.deadline}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, deadline: e.target.value }))
                            }
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">내용</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                        required
                        rows={10}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {submitting ? "수정 중..." : "수정 완료"}
                    </button>
                </div>
            </form>
        </div>
    );
}
