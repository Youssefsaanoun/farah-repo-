# Stage 1: Build the Frontend (Angular outputs to dist/<project-name>/browser per angular.json)
FROM node:20 as frontend-build
WORKDIR /app/frontend
COPY FrontEnd/package*.json ./
RUN npm install
COPY FrontEnd/ .
RUN npm run build -- --configuration production
# Verify Angular output exists (project name "FrontEnd" in angular.json)
RUN test -f dist/FrontEnd/browser/index.html || (echo "Angular output not at dist/FrontEnd/browser - check angular.json project name" && ls -la dist/ 2>/dev/null || true && exit 1)

# Stage 2: Build the Backend
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY BackEnd/pom.xml .
COPY BackEnd/src ./src

# Copy built frontend into Spring Boot static resources (served at / and /index.html)
COPY --from=frontend-build /app/frontend/dist/FrontEnd/browser/ ./src/main/resources/static/
RUN test -f src/main/resources/static/index.html || (echo "static/index.html missing - frontend not copied" && exit 1)
RUN mvn clean package -DskipTests

# Run stage - Render injects PORT at runtime; server.port=${PORT:8080} in application.properties
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
