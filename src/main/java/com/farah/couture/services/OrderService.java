package com.farah.couture.services;

import com.farah.couture.entities.Order;
import java.util.List;

public interface OrderService {
    Order placeOrder(Long userId, String phoneNumber, String region, String address, String postalCode);

    List<Order> getUserOrders(Long userId);

    Order getOrderById(Long orderId);

    List<Order> getAllOrders();

    Order updateStatus(Long orderId, com.farah.couture.entities.OrderStatus status);

    int fixAllTrackingCodes();

    void deleteOrder(Long orderId);
}
