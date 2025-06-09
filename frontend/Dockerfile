FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# 의도적인 취약점: 불필요한 개발 종속성 포함 (보안 취약점 학습 목적)
RUN npm install -g nodemon

EXPOSE 3000

CMD ["npm", "start"]
