package com.farah.couture.services;

import com.farah.couture.entities.Category;
import com.farah.couture.entities.Product;
import java.util.List;

public interface ProductService {
    List<Product> getAllProducts();

    List<Product> getProductsByCategory(Long categoryId);

    List<Product> searchProducts(String keyword);

    Product getProductById(Long id);

    Product saveProduct(Product product);

    Product updateProduct(Long id, Product product);

    void deleteProduct(Long id);

    List<Category> getAllCategories();
}
