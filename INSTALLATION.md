# 🚀 CoinTalk 완전 설치 가이드

## 📋 사전 요구사항
- **Docker Desktop** 설치 및 실행 중
- **Git** 설치
- **최소 8GB RAM** 권장

## 🔧 빠른 설치

### Linux/Mac:
```bash
git clone https://github.com/logiciris/cointalk.git
cd cointalk
chmod +x install.sh
./install.sh
```

### Windows:
```cmd
git clone https://github.com/logiciris/cointalk.git
cd cointalk
install.bat
```

## 🌐 접속
- **메인 사이트**: http://localhost
- **직접 접속**: http://localhost:3000

## 🔐 테스트 계정
```
ID: test2
PW: testpass123
```

## 🛠 문제 발생 시

### 회원가입 실패:
```bash
# 서비스 재시작
docker-compose restart backend frontend

# 완전 재시작
docker-compose down
docker-compose up -d
```

### 초기화 문제:
```bash
# 완전 정리 후 재설치
docker-compose down -v
docker-compose up --build -d
```

### 상태 확인:
```bash
docker-compose ps
docker-compose logs backend
```

정상 실행되면 회원가입, 로그인, 2차인증 모두 정상 작동합니다.
