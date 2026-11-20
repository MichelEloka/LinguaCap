FROM eclipse-temurin:21-jre-alpine
WORKDIR /opt/linguacap
COPY --chown=10001:10001 . .
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=65.0", "-jar", "quarkus-run.jar"]
