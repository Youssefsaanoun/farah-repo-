package com.farah.couture.controllers;

import com.farah.couture.entities.Cart;
import com.farah.couture.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/{userId}")
    public Cart getCart(@PathVariable Long userId) {
        return cartService.getCartByUserId(userId);
    }

    @PostMapping("/{userId}/add")
    public Cart addToCart(@PathVariable Long userId, @RequestParam Long variantId, @RequestParam int quantity) {
        return cartService.addToCart(userId, variantId, quantity);
    }

    @DeleteMapping("/{userId}/remove/{cartItemId}")
    public Cart removeFromCart(@PathVariable Long userId, @PathVariable Long cartItemId) {
        return cartService.removeFromCart(userId, cartItemId);
    }

    @PutMapping("/{userId}/update/{cartItemId}")
    @CrossOrigin(origins = "http://localhost:4200")
    public Cart updateQuantity(@PathVariable Long userId, @PathVariable Long cartItemId, @RequestParam int quantity) {
        System.out.println("Updating cart item " + cartItemId + " to qty " + quantity);
        return cartService.updateQuantity(userId, cartItemId, quantity);
    }
}
