package com.farah.couture.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // CORS is now handled by CorsConfig.java via CorsFilter

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String projectDir = System.getProperty("user.dir");
        // Handle path traversal to reach standard uploads directory structure
        java.nio.file.Path uploadPath = java.nio.file.Paths.get(projectDir);
        if (projectDir.endsWith("BackEnd")) {
            uploadPath = uploadPath.getParent();
        }
        uploadPath = uploadPath.resolve("uploads/images");

        String uploadPathStr = uploadPath.toUri().toString();

        registry.addResourceHandler("/images/**")
                .addResourceLocations(uploadPathStr);
        
        // Removed manual "/**" handler to allow Spring Boot auto-configuration 
        // to handle static resources (classpath:/static/) correctly.
    }
}
