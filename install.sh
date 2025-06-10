#!/bin/bash

echo "🚀 CoinTalk 설치 스크립트 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker가 설치되지 않았습니다. Docker Desktop을 설치해주세요.${NC}"
    echo "📥 다운로드: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Docker Compose 확인
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose가 설치되지 않았습니다.${NC}"
    exit 1
fi

# Docker 실행 확인
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker가 실행되지 않고 있습니다. Docker Desktop을 시작해주세요.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker 환경 확인 완료${NC}"

# 포트 사용 확인
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  포트 $1이 사용 중입니다.${NC}"
        return 1
    fi
    return 0
}

echo "🔍 포트 사용 상태 확인 중..."
PORTS=(80 3000 5000 3306 6379)
for port in "${PORTS[@]}"; do
    if ! check_port $port; then
        echo -e "${RED}❌ 포트 $port가 이미 사용 중입니다. 프로세스를 종료하거나 다른 포트를 사용하세요.${NC}"
        # exit 1  # 경고만 하고 계속 진행
    fi
done

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리 중..."
docker-compose down -v --remove-orphans 2>/dev/null || true

# 환경설정 파일 복사
if [ ! -f .env ]; then
    echo "📝 환경설정 파일 생성 중..."
    cp .env.example .env 2>/dev/null || echo "# Auto-generated .env file" > .env
fi

# 컨테이너 빌드 및 실행
echo "🔨 Docker 컨테이너 빌드 및 실행 중..."
docker-compose up --build -d

echo "⏳ 서비스 초기화 대기 중... (최대 3분)"

# MySQL 초기화 대기
echo "🗄️  MySQL 초기화 대기 중..."
timeout=180
count=0
while [ $count -lt $timeout ]; do
    if docker-compose logs mysql 2>/dev/null | grep -q "ready for connections" ; then
        echo -e "${GREEN}✅ MySQL 초기화 완료${NC}"
        break
    fi
    echo -n "."
    sleep 5
    count=$((count + 5))
done

if [ $count -ge $timeout ]; then
    echo -e "${RED}❌ MySQL 초기화 타임아웃${NC}"
    exit 1
fi

# 백엔드 시작 대기
echo "🔧 백엔드 서비스 시작 대기 중..."
count=0
while [ $count -lt 60 ]; do
    if docker-compose logs backend 2>/dev/null | grep -q "Database connection test successful" ; then
        echo -e "${GREEN}✅ 백엔드 서비스 시작 완료${NC}"
        break
    fi
    echo -n "."
    sleep 3
    count=$((count + 3))
done

# 프론트엔드 시작 대기
echo "🎨 프론트엔드 서비스 시작 대기 중..."
count=0
while [ $count -lt 60 ]; do
    if docker-compose logs frontend 2>/dev/null | grep -q "webpack compiled" ; then
        echo -e "${GREEN}✅ 프론트엔드 서비스 시작 완료${NC}"
        break
    fi
    echo -n "."
    sleep 3
    count=$((count + 3))
done

# 최종 상태 확인
echo ""
echo "📊 서비스 상태 확인:"
docker-compose ps

# 접속 가능 여부 테스트
echo ""
echo "🌐 접속 테스트 중..."
if curl -s http://localhost:5000/api/debug > /dev/null; then
    echo -e "${GREEN}✅ API 서버 정상 작동${NC}"
else
    echo -e "${YELLOW}⚠️  API 서버 아직 준비 중... 잠시 후 다시 시도하세요${NC}"
fi

echo ""
echo "🎉 CoinTalk 설치 완료!"
echo ""
echo "📱 접속 방법:"
echo "   🌐 메인 사이트: http://localhost"
echo "   🔧 프론트엔드: http://localhost:3000"
echo "   🔌 API 문서:   http://localhost:5000/api/debug"
echo ""
echo "🔐 테스트 계정:"
echo "   ID: test2"
echo "   PW: testpass123"
echo ""
echo "📝 로그 확인: docker-compose logs -f"
echo "🛑 종료: docker-compose down"
echo ""
echo -e "${GREEN}Happy Hacking! 🚀${NC}"
