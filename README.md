# CoinTalk 🪙

암호화폐 커뮤니티를 위한 차세대 소셜 미디어 플랫폼

## 📖 소개

CoinTalk은 암호화폐 투자자, 트레이더, 개발자들이 모여 정보를 공유하고 소통할 수 있는 전문 소셜 플랫폼입니다. 실시간 시세 정보, 기술적 분석, 투자 인사이트를 한 곳에서 만나보세요.

## ✨ 주요 기능

### 💬 소셜 기능
- **게시물 작성 및 공유**: 마크다운 지원, 리치 텍스트 에디터
- **댓글 시스템**: 실시간 댓글 및 대댓글
- **좋아요 및 북마크**: 관심 있는 콘텐츠 저장
- **팔로우 시스템**: 관심 있는 사용자 팔로우

### 📊 암호화폐 정보
- **실시간 코인 시세**: 주요 암호화폐 가격 모니터링
- **코인별 커뮤니티**: 각 코인에 대한 전용 토론 공간
- **시장 분석**: 기술적 분석 및 시장 트렌드

### 🔍 탐색 및 검색
- **통합 검색**: 게시물, 사용자, 해시태그 검색
- **트렌딩 태그**: 인기 있는 주제 실시간 추적
- **활발한 사용자**: 커뮤니티 리더 발견

### 🔐 보안 기능
- **2차 인증 (2FA)**: Google Authenticator 연동
- **안전한 로그인**: JWT 토큰 기반 인증
- **프라이버시 설정**: 개인정보 보호 옵션

### ⚙️ 사용자 설정
- **프로필 커스터마이징**: 아바타, 자기소개 설정
- **알림 관리**: 맞춤형 알림 설정
- **다국어 지원**: 한국어, 영어 지원 (예정)

## 🛠 기술 스택

### Frontend
- **React.js 18**: 모던 리액트 훅 및 컴포넌트
- **Redux Toolkit**: 상태 관리
- **React Router v6**: 클라이언트 사이드 라우팅
- **Bootstrap 5**: 반응형 UI 프레임워크
- **React Icons**: 아이콘 라이브러리

### Backend
- **Node.js**: 서버 사이드 JavaScript 런타임
- **Express.js**: 웹 애플리케이션 프레임워크
- **JWT**: 인증 및 권한 관리
- **bcryptjs**: 비밀번호 해싱

### Database
- **MySQL 8.0**: 관계형 데이터베이스
- **Redis**: 캐싱 및 세션 관리

### DevOps
- **Docker**: 컨테이너화
- **Docker Compose**: 멀티 컨테이너 관리
- **Nginx**: 리버스 프록시 및 정적 파일 서빙

## 🚀 시작하기

### 필수 조건
- Docker 및 Docker Compose
- Node.js 18+ (개발용)
- Git

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/yourusername/cointalk.git
cd cointalk
```

2. **Docker로 실행**
```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

3. **접속**
- 메인 애플리케이션: http://localhost:3000
- API 서버: http://localhost:5000
- 관리자 패널: http://localhost:3000/admin

### 개발 환경 설정

1. **의존성 설치**
```bash
# 프론트엔드
cd frontend
npm install

# 백엔드
cd ../backend
npm install
```

2. **환경 변수 설정**
```bash
# backend/.env 파일 생성
cp .env.example .env
```

3. **데이터베이스 초기화**
```bash
# MySQL 컨테이너 실행 후
docker exec -it cointalk-mysql-1 mysql -u root -proot_password cointalk < database/schema.sql
```

## 📱 스크린샷

### 홈페이지
메인 피드에서 최신 암호화폐 뉴스와 커뮤니티 게시물을 확인하세요.

### 탐색 페이지
트렌딩 토픽과 인기 사용자를 발견하고 새로운 인사이트를 얻으세요.

### 프로필 페이지
개인 프로필에서 작성한 게시물과 좋아요한 콘텐츠를 관리하세요.

## 🔧 API 문서

### 인증
```
POST /api/auth/register - 회원가입
POST /api/auth/login - 로그인
POST /api/auth/logout - 로그아웃
POST /api/auth/verify-2fa - 2차 인증 검증
```

### 게시물
```
GET /api/posts - 게시물 목록
POST /api/posts - 게시물 작성
GET /api/posts/:id - 게시물 상세
PUT /api/posts/:id - 게시물 수정
DELETE /api/posts/:id - 게시물 삭제
```

### 사용자
```
GET /api/users/profile/:username - 사용자 프로필
PUT /api/users/profile - 프로필 수정
PUT /api/users/change-password - 비밀번호 변경
```

## 📊 프로젝트 구조

```
cointalk/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── redux/          # Redux 상태 관리
│   │   ├── services/       # API 서비스
│   │   └── styles/         # CSS 스타일
├── backend/                  # Node.js 백엔드
│   ├── src/
│   │   ├── controllers/    # 컨트롤러
│   │   ├── middlewares/    # 미들웨어
│   │   ├── models/         # 데이터 모델
│   │   ├── routes/         # API 라우트
│   │   └── utils/          # 유틸리티
├── database/                # 데이터베이스 스키마 및 시드
├── nginx/                   # Nginx 설정
└── docker-compose.yml       # Docker 구성
```

## 🤝 기여하기

CoinTalk 프로젝트에 기여해주세요!

1. 포크 (Fork) 생성
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

### 개발 가이드라인
- ES6+ 문법 사용
- 컴포넌트는 함수형으로 작성
- CSS는 Bootstrap 클래스 우선 사용
- API는 RESTful 설계 원칙 준수

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

- 프로젝트 링크: [https://github.com/yourusername/cointalk](https://github.com/yourusername/cointalk)
- 이슈 리포트: [GitHub Issues](https://github.com/yourusername/cointalk/issues)

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받았습니다:

- [React](https://reactjs.org/)
- [Express.js](https://expressjs.com/)
- [Bootstrap](https://getbootstrap.com/)
- [MySQL](https://mysql.com/)
- [Docker](https://docker.com/)

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!
