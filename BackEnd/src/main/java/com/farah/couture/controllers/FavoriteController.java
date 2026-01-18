package com.farah.couture.controllers;

import com.farah.couture.entities.Favorite;
import com.farah.couture.services.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @GetMapping("/{userId}")
    public List<Favorite> getUserFavorites(@PathVariable Long userId) {
        return favoriteService.getFavoritesByUserId(userId);
    }

    @PostMapping("/{userId}/{productId}")
    public Favorite addFavorite(@PathVariable Long userId, @PathVariable Long productId) {
        return favoriteService.addFavorite(userId, productId);
    }

    @DeleteMapping("/{userId}/{productId}")
    public void removeFavorite(@PathVariable Long userId, @PathVariable Long productId) {
        favoriteService.removeFavorite(userId, productId);
    }
}
