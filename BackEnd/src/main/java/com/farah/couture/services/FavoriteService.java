package com.farah.couture.services;

import com.farah.couture.entities.Favorite;
import com.farah.couture.entities.Product;
import com.farah.couture.entities.User;
import com.farah.couture.repositories.FavoriteRepository;
import com.farah.couture.repositories.ProductRepository;
import com.farah.couture.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FavoriteService {
    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Favorite> getFavoritesByUserId(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    public Favorite addFavorite(Long userId, Long productId) {
        // Check if already exists
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        for (Favorite f : favorites) {
            if (f.getProduct().getId().equals(productId)) {
                return f; // Already favorite
            }
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setProduct(product);
        return favoriteRepository.save(favorite);
    }

    public void removeFavorite(Long userId, Long productId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        for (Favorite f : favorites) {
            if (f.getProduct().getId().equals(productId)) {
                favoriteRepository.delete(f);
                return;
            }
        }
    }
}
