# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY BackEnd/pom.xml .
COPY BackEnd/src ./src

# Verify frontend assets are present (copied from local commit)
RUN test -f src/main/resources/static/index.html || (echo "static/index.html missing - frontend not found in src" && exit 1)
RUN mvn clean package -DskipTests


# Run stage - Render injects PORT at runtime; server.port=${PORT:8080} in application.properties
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
