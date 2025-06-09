FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# 의도적인 취약점: 불필요한 개발 종속성 포함 (보안 취약점 학습 목적)
RUN npm install -g nodemon

COPY . .

# 의도적인 취약점: 루트 권한으로 실행 (보안 취약점 학습 목적)
# 실제 프로덕션 환경에서는 USER node 등으로 비특권 사용자 사용해야 함

EXPOSE 5000

CMD ["npm", "start"]
