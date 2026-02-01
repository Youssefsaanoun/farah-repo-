# Stage 1: Build the Frontend
FROM node:20 as frontend-build
WORKDIR /app/frontend
# Copy frontend source code
COPY FrontEnd/package*.json ./
RUN npm install
COPY FrontEnd/ .
RUN npm run build -- --configuration production

# Stage 2: Build the Backend
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY BackEnd/pom.xml .
COPY BackEnd/src ./src

# Copy built frontend assets to Spring Boot static resources directory
# Adjust the source path (dist/FrontEnd/browser) if your angular.json output path is different
COPY --from=frontend-build /app/frontend/dist/FrontEnd/browser ./src/main/resources/static

RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
