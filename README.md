# Study Recruit Platform Frontend

스터디원 모집 플랫폼의 프론트엔드입니다.  
스터디 모집 게시글 조회/작성부터 지원, 실시간 채팅, 알림까지 하나의 인터페이스에서 제공합니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Language | TypeScript |
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| 실시간 통신 | WebSocket (STOMP / SockJS), SSE |
| 배포 | Vercel |

---

## 주요 기능

### 1. 인증
- 카카오 OAuth 2.0 로그인
- JWT Access Token / Refresh Token 관리

### 2. 스터디 모집 게시글
- 게시글 목록 (기술스택 / 모집상태 필터링, 페이징)
- 키워드 / 기술스택 / 모집상태 검색 (Elasticsearch 연동)
- 게시글 상세 조회 / 작성 / 수정 / 삭제

### 3. 지원 시스템
- 스터디 지원 / 취소
- 지원자 목록 확인 / 승인 / 거절

### 4. 댓글
- 게시글별 댓글 작성 / 수정 / 삭제
- `@닉네임` 멘션 기능

### 5. 실시간 채팅
- WebSocket + STOMP 기반 스터디팀 채팅방

### 6. 실시간 알림
- SSE 기반 실시간 알림 수신
- 알림 종류: 지원 접수, 승인/거절, 댓글, 멘션, 팀 일정, 마감 D-1 리마인더
- 읽음 처리 / 미읽음 카운트 / 전체 읽음

### 7. 스터디팀 관리
- 팀 정보 조회 / 멤버 역할 확인
- 팀 일정 CRUD

---

## 프로젝트 구조

```
src/
├── app/                # App Router 페이지
├── components/         # 공통 컴포넌트
│   └── ui/             # shadcn/ui 컴포넌트
├── lib/                # 유틸리티, API 클라이언트
└── types/              # TypeScript 타입 정의
```

---

## 백엔드 레포지토리

백엔드는 별도 레포지토리로 관리됩니다.  
👉 [study-recruit-platform](https://github.com/KTH1007/study-recruit-platform)

| 분류 | 기술 |
|------|------|
| Language | Java 21 |
| Framework | Spring Boot 4.0.3 |
| Auth | Kakao OAuth 2.0, JWT |
| Realtime | WebSocket (STOMP / SockJS), SSE |
| Messaging | Apache Kafka |
| Search | Elasticsearch 9.0.2 |
| Cache | Redis 7 |
| Infra | AWS EC2, Nginx, Docker, GitHub Actions |

---

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버: [http://localhost:3000](http://localhost:3000)
