@echo off
echo CoinTalk 설치 스크립트 시작...

docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker가 설치되지 않았습니다.
    echo 다운로드: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo Docker가 실행되지 않고 있습니다. Docker Desktop을 시작해주세요.
    pause
    exit /b 1
)

echo Docker 환경 확인 완료

echo 기존 컨테이너 정리 중...
docker-compose down -v --remove-orphans 2>nul

if not exist .env (
    echo 환경설정 파일 생성 중...
    if exist .env.example (
        copy .env.example .env >nul
    ) else (
        echo # Auto-generated .env file > .env
    )
)

echo Docker 컨테이너 빌드 및 실행 중...
docker-compose up --build -d

echo 서비스 초기화 대기 중... (최대 3분)
timeout /t 60 /nobreak >nul

echo.
echo 서비스 상태 확인:
docker-compose ps

echo.
echo CoinTalk 설치 완료!
echo.
echo 접속 방법:
echo    메인 사이트: http://localhost
echo    프론트엔드: http://localhost:3000
echo    API 문서: http://localhost:5000/api/debug
echo.
echo 테스트 계정:
echo    ID: test2
echo    PW: testpass123
echo.
echo 로그 확인: docker-compose logs -f
echo 종료: docker-compose down

pause
