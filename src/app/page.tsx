import Link from "next/link";

const features = [
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        title: "스터디 모집",
        description: "기술스택, 인원, 마감일을 설정해 원하는 스터디원을 모집하세요.",
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
        ),
        title: "기술스택 필터",
        description: "Java, Spring, React 등 원하는 기술스택으로 스터디를 빠르게 찾아보세요.",
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        title: "지원 관리",
        description: "지원자의 메시지를 확인하고 승인 또는 거절로 스터디원을 선발하세요.",
    },
    {
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        ),
        title: "댓글 소통",
        description: "게시글에 댓글을 남겨 스터디 방향이나 질문을 자유롭게 나누세요.",
    },
];

const steps = [
    { step: "01", title: "카카오로 시작", desc: "카카오 계정으로 간편하게 로그인하세요." },
    { step: "02", title: "스터디 탐색", desc: "기술스택과 모집 상태로 필터링해 원하는 스터디를 찾으세요." },
    { step: "03", title: "지원하기", desc: "지원 메시지를 작성하고 스터디에 참여 신청하세요." },
    { step: "04", title: "함께 성장", desc: "승인된 팀원들과 스터디를 시작하세요." },
];

export default function HomePage() {
    return (
        <div className="flex flex-col">
            {/* Hero */}
            <section className="relative overflow-hidden bg-white">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#eef2ff_0%,_transparent_60%)]" />
                <div className="relative mx-auto max-w-5xl px-4 py-24 text-center">
                    <span className="mb-4 inline-block rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-medium text-indigo-600">
                        스터디 모집 플랫폼
                    </span>
                    <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                        함께 성장할 스터디원을
                        <br />
                        <span className="text-indigo-600">지금 찾아보세요</span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-xl text-base leading-7 text-slate-500">
                        기술스택 기반으로 스터디를 모집하고, 지원자를 관리하고,
                        <br />
                        댓글로 소통하며 함께 성장하는 공간입니다.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/posts"
                            className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                        >
                            스터디 둘러보기
                        </Link>
                        <Link
                            href="/login"
                            className="rounded-xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            시작하기 →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-slate-50 py-20">
                <div className="mx-auto max-w-5xl px-4">
                    <h2 className="mb-2 text-center text-2xl font-bold text-slate-900">주요 기능</h2>
                    <p className="mb-12 text-center text-sm text-slate-400">스터디 모집부터 관리까지 한 곳에서</p>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    {f.icon}
                                </div>
                                <h3 className="mb-2 text-sm font-semibold text-slate-800">{f.title}</h3>
                                <p className="text-xs leading-6 text-slate-500">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-4xl px-4">
                    <h2 className="mb-2 text-center text-2xl font-bold text-slate-900">이용 방법</h2>
                    <p className="mb-12 text-center text-sm text-slate-400">4단계로 스터디를 시작하세요</p>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((s) => (
                            <div key={s.step} className="relative flex flex-col gap-3 pl-2">
                                <span className="text-3xl font-black text-indigo-100">{s.step}</span>
                                <h3 className="text-sm font-semibold text-slate-800">{s.title}</h3>
                                <p className="text-xs leading-6 text-slate-500">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-indigo-600 py-16">
                <div className="mx-auto max-w-2xl px-4 text-center">
                    <h2 className="mb-4 text-2xl font-bold text-white">지금 바로 시작해보세요</h2>
                    <p className="mb-8 text-sm text-indigo-200">카카오 계정으로 간편하게 가입하고 스터디를 찾아보세요.</p>
                    <Link
                        href="/login"
                        className="inline-block rounded-xl bg-white px-8 py-3 text-sm font-semibold text-indigo-600 shadow transition hover:bg-indigo-50"
                    >
                        카카오로 시작하기
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
                © 2025 StudyMeet. 스터디 모집 플랫폼
            </footer>
        </div>
    );
}
