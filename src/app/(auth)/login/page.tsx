export default function LoginPage() {
    const handleKakaoLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/kakao`;
    };

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <h1 className="text-2xl font-bold">스터디 모집 플랫폼</h1>
                <button
                    onClick={handleKakaoLogin}
                    className="flex items-center gap-2 rounded-lg bg-[#FEE500] px-6 py-3 font-medium text-black"
                >
                    카카오로 시작하기
                </button>
            </div>
        </main>
    );
}