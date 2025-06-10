# 🐳 CoinTalk Docker 실행 가이드

## 📋 사전 요구사항
- Docker 및 Docker Compose 설치
- Git

## 🚀 실행 방법

```bash
# 1. 프로젝트 클론
git clone https://github.com/logiciris/cointalk.git
cd cointalk

# 2. Docker 컨테이너 빌드 및 실행
docker-compose up --build

# 3. 브라우저에서 접속
http://localhost
```

## 🔧 서비스 구성
- **Frontend**: http://localhost (React)
- **Backend API**: http://localhost/api (Express.js)
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

## 📱 2차 인증 기능
- 회원가입 후 보안 설정에서 2FA 활성화 가능
- QR 코드 스캔으로 Google Authenticator 연동
- 백업 코드 제공

## 🔒 테스트 계정
```
ID: testuser
PW: testpass123
```

## 🛠 개발 모드 실행
```bash
# 개별 서비스 재시작
docker-compose restart backend
docker-compose restart frontend

# 로그 확인
docker-compose logs -f backend
```

## 🚨 주의사항
- 이 프로젝트는 보안 취약점 학습용입니다
- 프로덕션 환경에서 사용하지 마세요
