# Node.js 빌드 단계
FROM node:18-slim AS build

# 필요한 빌드 도구 설치
RUN apt-get update && apt-get install -y bash python3 make g++

# 작업 디렉토리 설정
WORKDIR /app

# 환경 변수 전달
ARG VITE_APP_API_BASE_URL
ARG VITE_APP_BASE_URL
ARG VITE_APP_IMP_KEY

ENV VITE_APP_API_BASE_URL=${VITE_APP_API_BASE_URL}
ENV VITE_APP_BASE_URL=${VITE_APP_BASE_URL}
ENV VITE_APP_IMP_KEY=${VITE_APP_IMP_KEY}

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
RUN npm rebuild && npm run build

# Nginx 사용 단계
FROM nginx:alpine

# 빌드된 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 5173

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
