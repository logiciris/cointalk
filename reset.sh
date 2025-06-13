#!/bin/bash

echo "🔄 CoinTalk 완전 초기화 및 재시작..."

# 기존 컨테이너 완전 정리
echo "🧹 기존 컨테이너 및 볼륨 완전 삭제 중..."
docker-compose down -v --remove-orphans 2>/dev/null || true

# Docker 시스템 정리
echo "🔧 Docker 시스템 정리 중..."
docker system prune -f 2>/dev/null || true
docker volume prune -f 2>/dev/null || true

# 프로젝트 관련 볼륨만 삭제
echo "💾 프로젝트 볼륨 삭제 중..."
docker volume rm cointalk_mysql-data 2>/dev/null || true
docker volume rm cointalk_redis-data 2>/dev/null || true
docker volume rm cointalk_uploads-data 2>/dev/null || true

# 컨테이너 재빌드 및 실행
echo "🔨 컨테이너 재빌드 및 실행 중..."
docker-compose up --build -d

echo "⏳ MySQL 초기화 대기 중... (최대 3분)"

# MySQL 초기화 대기
timeout=180
count=0
while [ $count -lt $timeout ]; do
    if docker-compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo "✅ MySQL 초기화 완료!"
        break
    fi
    echo -n "."
    sleep 5
    count=$((count + 5))
done

if [ $count -ge $timeout ]; then
    echo "❌ MySQL 초기화 타임아웃"
    echo "로그 확인: docker-compose logs mysql"
    exit 1
fi

# 테이블 생성 확인
echo "🔍 테이블 생성 확인 중..."
docker-compose exec -T mysql mysql -u cointalk_user -ppassword123 cointalk -e "SHOW TABLES LIKE 'user_wallets';"

echo "🎉 완전 초기화 완료!"
echo "📱 접속: http://localhost"
