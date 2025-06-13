@echo off
chcp 65001 >nul
echo 🔄 CoinTalk 완전 초기화 및 재시작...

echo 🧹 기존 컨테이너 및 볼륨 완전 삭제 중...
docker-compose down -v --remove-orphans 2>nul

echo 🔧 Docker 시스템 정리 중...
docker system prune -f 2>nul
docker volume prune -f 2>nul

echo 💾 프로젝트 볼륨 삭제 중...
docker volume rm cointalk_mysql-data 2>nul
docker volume rm cointalk_redis-data 2>nul
docker volume rm cointalk_uploads-data 2>nul

echo 🔨 컨테이너 재빌드 및 실행 중...
docker-compose up --build -d

echo ⏳ MySQL 초기화 대기 중... (3분)
ping 127.0.0.1 -n 180 >nul

echo 🎉 완전 초기화 완료!
echo 📱 접속: http://localhost

pause
