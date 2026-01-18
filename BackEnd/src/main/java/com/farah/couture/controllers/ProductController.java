package com.farah.couture.controllers;

import com.farah.couture.entities.Category;
import com.farah.couture.entities.Product;
import com.farah.couture.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @GetMapping("/category/{categoryId}")
    public List<Product> getProductsByCategory(@PathVariable Long categoryId) {
        return productService.getProductsByCategory(categoryId);
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String q) {
        return productService.searchProducts(q);
    }

    @GetMapping("/categories")
    public List<Category> getAllCategories() {
        return productService.getAllCategories();
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        System.out.println("Update Request for ID: " + id);
        if (product.getVariants() != null) {
            product.getVariants()
                    .forEach(v -> System.out.println("Variant: " + v.getSize() + ", Stock: " + v.getStockQuantity()));
        } else {
            System.out.println("No variants received in request");
        }
        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @PostMapping("/upload")
    public java.util.Map<String, String> uploadImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            // Save to "uploads/images" in the project root
            String projectDir = System.getProperty("user.dir");
            java.nio.file.Path uploadDir = java.nio.file.Paths.get(projectDir, "uploads", "images");

            if (!java.nio.file.Files.exists(uploadDir)) {
                java.nio.file.Files.createDirectories(uploadDir);
            }

            java.nio.file.Path filePath = uploadDir.resolve(fileName);
            java.nio.file.Files.write(filePath, file.getBytes());

            // Return relative URL matching the WebConfig resource handler
            return java.util.Collections.singletonMap("url", "/images/" + fileName);
        } catch (Exception e) {
            e.printStackTrace(); // Log error to console
            throw new RuntimeException("Failed to upload image: " + e.getMessage(), e);
        }
    }
}
