"use client";

const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI}&response_type=code`;

export default function LoginPage() {
    const handleKakaoLogin = () => {
        window.location.href = KAKAO_AUTH_URL;
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-bold text-indigo-600">StudyMeet</h1>
                    <p className="text-sm text-slate-500">스터디원을 모집하고 함께 성장하세요</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="mb-6 text-center text-sm text-slate-500">소셜 계정으로 간편 로그인</p>
                    <button
                        onClick={handleKakaoLogin}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-6 py-3 text-sm font-semibold text-[#191919] transition hover:brightness-95"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9 1C4.582 1 1 3.79 1 7.22c0 2.17 1.397 4.08 3.508 5.186l-.895 3.34a.25.25 0 0 0 .373.277L7.824 13.6A10.06 10.06 0 0 0 9 13.44c4.418 0 8-2.79 8-6.22S13.418 1 9 1z"
                                fill="#191919"
                            />
                        </svg>
                        카카오로 시작하기
                    </button>
                </div>
            </div>
        </div>
    );
}
