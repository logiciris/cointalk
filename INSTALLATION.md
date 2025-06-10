# 🚀 CoinTalk 완전 설치 가이드

## 📋 사전 요구사항
- **Docker Desktop** 설치 및 실행 중
- **Git** 설치
- **최소 8GB RAM** 권장
- **포트 80, 3000, 5000, 3306, 6379** 사용 가능

## 🔧 Step 1: 프로젝트 다운로드
```bash
git clone https://github.com/logiciris/cointalk.git
cd cointalk
```

## 🔧 Step 2: 환경 설정 (선택사항)
```bash
# 기본 설정 사용 또는 커스텀 설정
cp .env.example .env
# 필요시 .env 파일 수정
```

## 🔧 Step 3: Docker 실행
```bash
# 백그라운드 실행 (권장)
docker-compose up -d

# 또는 로그 확인하며 실행
docker-compose up --build
```

## ⏳ Step 4: 초기화 대기 (중요!)
**첫 실행 시 MySQL 초기화에 2-3분 소요됩니다**

### 진행상황 확인:
```bash
# 모든 서비스 상태 확인
docker-compose ps

# 백엔드 로그 확인 (DB 연결 확인)
docker-compose logs backend

# "✅ Database connection test successful" 메시지 대기
```

## 🌐 Step 5: 접속 확인
### 방법 1: Nginx를 통한 접속 (권장)
- http://localhost

### 방법 2: 직접 프론트엔드 접속
- http://localhost:3000

### 방법 3: API 직접 테스트
- http://localhost:5000/api/debug

## 🔐 Step 6: 테스트 계정 또는 회원가입
```
테스트 계정:
ID: test2
PW: testpass123

또는 새 계정 회원가입
```

## ❌ 문제 해결

### 1. "네트워크 오류" 발생 시:
```bash
# 서비스 재시작
docker-compose restart backend frontend

# 또는 전체 재시작
docker-compose down
docker-compose up -d
```

### 2. 포트 충돌 시:
```bash
# 사용 중인 포트 확인
netstat -tulpn | grep :80
netstat -tulpn | grep :3000

# 점유 프로세스 종료 후 재실행
```

### 3. MySQL 연결 실패 시:
```bash
# MySQL 컨테이너 로그 확인
docker-compose logs mysql

# MySQL 완전 초기화
docker-compose down -v
docker-compose up -d
```

### 4. 브라우저 캐시 문제:
- **Ctrl+F5** (강제 새로고침)
- **Ctrl+Shift+Delete** (캐시 삭제)
- **시크릿/프라이빗 모드**에서 접속

### 5. Docker 권한 문제 (Linux):
```bash
sudo usermod -aG docker $USER
newgrp docker
```

## 🎯 성공 확인 체크리스트
- [ ] `docker-compose ps` 모든 서비스 UP 상태
- [ ] http://localhost 접속 성공
- [ ] 회원가입/로그인 동작
- [ ] 2차인증 QR코드 표시
- [ ] 게시물 목록 표시

## 🆘 그래도 안될 때
1. **모든 Docker 컨테이너 정리:**
```bash
docker-compose down -v
docker system prune -f
docker-compose up --build -d
```

2. **개별 서비스 로그 확인:**
```bash
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mysql
```

3. **직접 API 테스트:**
```bash
curl http://localhost:5000/api/debug
```

## 🔧 개발 모드
```bash
# 실시간 로그 보기
docker-compose logs -f

# 특정 서비스 재시작
docker-compose restart backend

# 볼륨 포함 완전 삭제
docker-compose down -v --remove-orphans
```

## 📝 참고사항
- 이 프로젝트는 **보안 취약점 학습용**입니다
- 프로덕션 환경에서 사용하지 마세요
- 초기 데이터베이스 구축에 시간이 걸립니다
- 문제 발생 시 이슈로 제보해주세요
