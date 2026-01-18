package com.farah.couture.services;

import com.farah.couture.entities.Cart;

public interface CartService {
    Cart getCartByUserId(Long userId);

    Cart addToCart(Long userId, Long variantId, int quantity);

    Cart removeFromCart(Long userId, Long cartItemId);

    Cart updateQuantity(Long userId, Long cartItemId, int quantity);

    void clearCart(Long userId);
}
