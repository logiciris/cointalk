# 🚀 CoinTalk - 암호화폐 소셜 미디어 플랫폼

## 📱 빠른 시작

### 🖱️ 원클릭 설치 (추천)
```bash
# Linux/Mac
git clone https://github.com/logiciris/cointalk.git
cd cointalk
chmod +x install.sh
./install.sh
```

```cmd
# Windows
git clone https://github.com/logiciris/cointalk.git
cd cointalk
install.bat
```

### 🐳 수동 Docker 실행
```bash
git clone https://github.com/logiciris/cointalk.git
cd cointalk
docker-compose up --build -d
```

## 🌐 접속하기
- **메인 사이트**: http://localhost
- **프론트엔드**: http://localhost:3000  
- **API 문서**: http://localhost:5000/api/debug

## 🔐 테스트 계정
```
아이디: test2
비밀번호: testpass123
```

## 🔧 문제 해결
설치 가이드는 [INSTALLATION.md](INSTALLATION.md)를 참고하세요.

---

## 📖 프로젝트 소개

CoinTalk은 암호화폐를 주제로 한 소셜 미디어 플랫폼입니다.

### 🎯 주요 기능

#### 👥 사용자 기능
- 회원가입/로그인/로그아웃
- 2차 인증 (2FA) 설정
- 프로필 관리 및 개인 설정
- 사용자 팔로우/언팔로우

#### 📝 게시물 기능
- 게시물 작성/수정/삭제
- 이미지 및 파일 첨부
- 게시물 좋아요 및 북마크
- 태그 시스템

#### 💬 소셜 기능
- 댓글 시스템 (대댓글 지원)
- 실시간 알림
- 개인 메시지
- 코인별 관심 등록

#### 🪙 암호화폐 기능
- 코인 정보 조회
- 가격 데이터 표시
- 코인별 게시물 분류
- 코인 팔로우 기능

### 🚧 개발 예정 기능

#### 📊 차트 & 분석
- 실시간 가격 차트 (Chart.js/Recharts)
- 시간대별 필터 (1일/1주/1월/1년)
- 거래량 차트 및 기술적 지표
- 이동평균선 및 트렌드 분석

#### 💰 가상 거래 시스템
- 가상 지갑 시스템 (시작 잔고 $10,000)
- 코인 모의 매수/매도 기능
- 포트폴리오 관리 및 수익률 추적
- 거래 히스토리 및 성과 분석

#### 💬 코인별 실시간 채팅
- 코인별 전용 채팅방
- Socket.io 기반 실시간 메시징
- 차트 스크린샷 공유 기능
- 유저 레벨 시스템 (뉴비/트레이더/전문가)

#### 🎯 추가 기능
- 가격 알림 시스템
- 포트폴리오 수익률 랭킹
- 투자 성과 배지 시스템
- 코인 뉴스 피드 통합

### 🔧 기술 스택

#### Frontend
- **React 18** - 사용자 인터페이스
- **React Router** - 라우팅
- **Redux** - 상태 관리
- **Bootstrap 5** - UI 컴포넌트
- **Axios** - HTTP 클라이언트

#### Backend
- **Node.js + Express** - API 서버
- **MySQL 8.0** - 메인 데이터베이스
- **Redis** - 세션 및 캐시
- **Socket.IO** - 실시간 통신
- **JWT** - 인증 토큰

#### DevOps
- **Docker + Docker Compose** - 컨테이너화
- **Nginx** - 리버스 프록시
- **Git** - 버전 관리

### 📁 프로젝트 구조

```
cointalk/
├── frontend/          # React 프론트엔드
├── backend/           # Express.js API 서버
├── database/          # MySQL 스키마 및 데이터
├── nginx/             # Nginx 설정
├── admin-api/         # 관리자 API (내부용)
├── monitoring/        # 모니터링 서비스
├── mysql-config/      # MySQL 설정
├── docker-compose.yml # Docker 구성
├── install.sh         # Linux/Mac 설치 스크립트
├── install.bat        # Windows 설치 스크립트
└── INSTALLATION.md    # 설치 가이드
```

### 🤝 기여하기

새로운 기능 제안, 버그 수정, 문서 개선 등 모든 기여를 환영합니다!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### 📜 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

### 📞 지원 및 문의

- **Issues**: [GitHub Issues](https://github.com/logiciris/cointalk/issues)
- **Documentation**: [Wiki](https://github.com/logiciris/cointalk/wiki)

---

**Happy Coding! 🚀**
