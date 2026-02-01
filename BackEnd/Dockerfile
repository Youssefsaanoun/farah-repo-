# Stage 1: Build Angular Frontend
FROM node:20 as frontend-build
WORKDIR /app
COPY FrontEnd/package*.json ./
RUN npm install
COPY FrontEnd/ .
RUN npm run build -- --configuration=production

# Stage 2: Build Spring Boot Backend
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY BackEnd/pom.xml .
COPY BackEnd/src ./src
# Copy built Angular assets to Spring Boot static resources directory
COPY --from=frontend-build /app/dist/FrontEnd/browser ./src/main/resources/static
# Verify index.html exists (debugging step)
RUN ls -la ./src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Run Application
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
