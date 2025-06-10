@echo off
echo CoinTalk 간단 설치

docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker가 필요합니다
    pause
    exit /b 1
)

echo Docker 확인 완료

echo 기존 컨테이너 정리...
docker-compose down -v 2>nul

echo Docker 컨테이너 시작...
docker-compose up --build -d

echo 대기 중... (90초)
ping 127.0.0.1 -n 91 >nul

echo.
echo 설치 완료!
echo 접속: http://localhost
echo.
pause
