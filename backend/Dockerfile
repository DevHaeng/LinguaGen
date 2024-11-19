# Gradle을 포함한 OpenJDK 이미지 사용
FROM gradle:7.6.0-jdk17-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# 환경 변수 전달
ARG SPRING_REDIS_HOST
ARG SPRING_REDIS_PORT
ARG OPENAI_API_KEY
ENV SPRING_REDIS_HOST=${SPRING_REDIS_HOST}
ENV SPRING_REDIS_PORT=${SPRING_REDIS_PORT}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

# 프로젝트 소스 복사
COPY . .

# Gradle 빌드 실행
RUN gradle clean build --no-daemon

# 실행 단계
FROM openjdk:17-jdk-alpine

# JAR 파일 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 포트 노출
EXPOSE 8085

# Spring Boot 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "/app.jar"]
