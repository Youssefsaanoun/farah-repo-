package com.farah.couture.services.impl;

import com.farah.couture.entities.Category;
import com.farah.couture.entities.Product;
import com.farah.couture.repositories.CategoryRepository;
import com.farah.couture.repositories.ProductRepository;
import com.farah.couture.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    @Override
    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return productRepository.findAll();
        }
        String lowerKeyword = keyword.toLowerCase();
        return productRepository.findAll().stream()
                .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(lowerKeyword)) ||
                        (p.getPrice() != null && String.valueOf(p.getPrice()).contains(lowerKeyword)))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @Override
    public Product saveProduct(Product product) {
        if (product.getImages() != null) {
            product.getImages().forEach(img -> img.setProduct(product));
        }

        // Auto-create default variant if none exist (Required for Cart)
        if (product.getVariants() == null || product.getVariants().isEmpty()) {
            com.farah.couture.entities.Variant defaultVariant = new com.farah.couture.entities.Variant();
            defaultVariant.setProduct(product);
            defaultVariant.setSize("Standard");
            defaultVariant.setColor("Default");
            defaultVariant.setStockQuantity(100);

            if (product.getVariants() == null) {
                product.setVariants(new java.util.ArrayList<>());
            }
            product.getVariants().add(defaultVariant);
        } else {
            product.getVariants().forEach(v -> v.setProduct(product));
        }

        return productRepository.save(product);
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Product updateProduct(Long id, Product product) {
        Product existingProduct = productRepository.findById(id).orElse(null);
        if (existingProduct != null) {
            // Update basic fields
            existingProduct.setName(product.getName());
            existingProduct.setDescription(product.getDescription());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setCategory(product.getCategory());

            // Update Images if provided (logic kept simple for now)
            if (product.getImages() != null) {
                // Clear existing and add new, or merge?
                // For this specific issue, let's just ensure if new images come, we handle link
                product.getImages().forEach(img -> img.setProduct(existingProduct));
                // A simple strategy: if images provided, replace list?
                // Or actually, usually we don't update images via this PUT unless changed.
                // Let's keep previous logic for images but re-attach:
                if (!product.getImages().isEmpty()) {
                    existingProduct.setImages(product.getImages());
                }
            }

            // EXPLICIT LOGIC: Update Stock on the Default Variant
            if (product.getVariants() != null && !product.getVariants().isEmpty()) {
                com.farah.couture.entities.Variant incomingVar = product.getVariants().get(0);
                Integer newStock = incomingVar.getStockQuantity();
                System.out.println("DEBUG: Updating stock to " + newStock);

                if (existingProduct.getVariants() != null && !existingProduct.getVariants().isEmpty()) {
                    // Update existing default variant
                    com.farah.couture.entities.Variant existingVar = existingProduct.getVariants().get(0);
                    existingVar.setStockQuantity(newStock);
                    System.out.println("DEBUG: Stock updated on existing variant id: " + existingVar.getId());
                } else {
                    // Create new variant if none exists
                    if (existingProduct.getVariants() == null) {
                        existingProduct.setVariants(new java.util.ArrayList<>());
                    }
                    incomingVar.setProduct(existingProduct);
                    existingProduct.getVariants().add(incomingVar);
                    System.out.println("DEBUG: Added new variant with stock");
                }
            }

            return productRepository.save(existingProduct);
        }
        return null;
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
