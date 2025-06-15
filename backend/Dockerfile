FROM node:18-alpine

# 필수 도구 설치
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 글로벌 패키지 설치
RUN npm install -g nodemon

# wait-for 스크립트를 직접 생성
RUN echo '#!/bin/sh' > /wait-for.sh && \
    echo '# wait-for.sh' >> /wait-for.sh && \
    echo '' >> /wait-for.sh && \
    echo 'set -e' >> /wait-for.sh && \
    echo '' >> /wait-for.sh && \
    echo 'host="$1"' >> /wait-for.sh && \
    echo 'port="$2"' >> /wait-for.sh && \
    echo 'shift 2' >> /wait-for.sh && \
    echo 'cmd="$@"' >> /wait-for.sh && \
    echo '' >> /wait-for.sh && \
    echo 'until nc -z "$host" "$port"; do' >> /wait-for.sh && \
    echo '  >&2 echo "Waiting for $host:$port to be available..."' >> /wait-for.sh && \
    echo '  sleep 1' >> /wait-for.sh && \
    echo 'done' >> /wait-for.sh && \
    echo '' >> /wait-for.sh && \
    echo '>&2 echo "$host:$port is available - executing command"' >> /wait-for.sh && \
    echo 'exec $cmd' >> /wait-for.sh && \
    chmod +x /wait-for.sh

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 5000

# wait-for로 MySQL 연결 대기 후 서버 시작
CMD ["/wait-for.sh", "mysql", "3306", "npm", "start"]
