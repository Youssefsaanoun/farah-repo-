package com.farah.couture.config;

import com.farah.couture.entities.Category;
import com.farah.couture.entities.User;
import com.farah.couture.repositories.CategoryRepository;
import com.farah.couture.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed Categories if empty
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category(null, "Robes de Soirée", "Robes élégantes pour les soirées", null));
            categoryRepository.save(new Category(null, "Robes Mariage", "Robes blanches pour mariées", null));
            categoryRepository.save(new Category(null, "Robes Casual", "Pour tous les jours", null));
            System.out.println("Categories seeded.");
        }

        // Seed Admin User
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("Farah");
            admin.setEmail("admin@farah.com");
            admin.setPassword("admin123"); // In real app, encrypt this!
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println("Admin user seeded.");
        }
    }
}
