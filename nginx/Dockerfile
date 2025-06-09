FROM nginx:alpine

# 의도적인 취약점: 기본 설정 파일 사용 (보안 취약점 학습 목적)
# 실제 프로덕션 환경에서는 안전한 설정을 적용해야 함

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
