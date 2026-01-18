package com.farah.couture.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${DB_HOST:}")
    private String dbHost;

    @Value("${DB_PORT:5432}")
    private String dbPort;

    @Value("${DB_NAME:}")
    private String dbName;

    @Value("${DB_USER:}")
    private String dbUser;

    @Value("${DB_PASSWORD:}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String jdbcUrl;
        String username;
        String password;

        // If DATABASE_URL is provided (Render auto-linking), use it
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            // Convert postgresql:// to jdbc:postgresql://
            if (databaseUrl.startsWith("postgresql://")) {
                jdbcUrl = "jdbc:" + databaseUrl;
                // Extract username and password from DATABASE_URL
                // Format: postgresql://user:password@host:port/database
                try {
                    String urlWithoutProtocol = databaseUrl.substring(13); // Remove "postgresql://"
                    int atIndex = urlWithoutProtocol.indexOf('@');
                    if (atIndex > 0) {
                        String userPass = urlWithoutProtocol.substring(0, atIndex);
                        int colonIndex = userPass.indexOf(':');
                        if (colonIndex > 0) {
                            username = userPass.substring(0, colonIndex);
                            password = userPass.substring(colonIndex + 1);
                        } else {
                            username = userPass;
                            password = "";
                        }
                    } else {
                        username = dbUser;
                        password = dbPassword;
                    }
                } catch (Exception e) {
                    // Fallback to individual properties
                    username = dbUser;
                    password = dbPassword;
                }
            } else if (databaseUrl.startsWith("jdbc:postgresql://")) {
                jdbcUrl = databaseUrl;
                username = dbUser;
                password = dbPassword;
            } else {
                // Construct from individual properties
                jdbcUrl = constructJdbcUrl();
                username = dbUser;
                password = dbPassword;
            }
        } else {
            // Use individual properties
            jdbcUrl = constructJdbcUrl();
            username = dbUser;
            password = dbPassword;
        }

        // Validate required properties
        if ((jdbcUrl == null || jdbcUrl.isEmpty() || jdbcUrl.contains("${")) ||
            (username == null || username.isEmpty() || username.contains("${"))) {
            throw new IllegalStateException(
                "Database configuration is incomplete. " +
                "Please ensure DATABASE_URL or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD are set correctly."
            );
        }

        return DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url(jdbcUrl)
                .username(username)
                .password(password)
                .build();
    }

    private String constructJdbcUrl() {
        // Validate that we have required properties
        if (dbHost == null || dbHost.isEmpty() || dbHost.contains("${") ||
            dbName == null || dbName.isEmpty() || dbName.contains("${")) {
            return null;
        }
        return String.format("jdbc:postgresql://%s:%s/%s", dbHost, dbPort, dbName);
    }
}
