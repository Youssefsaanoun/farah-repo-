package com.farah.couture.controllers;

import com.farah.couture.entities.Order;
import com.farah.couture.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/{userId}/place")
    public Order placeOrder(@PathVariable Long userId, @RequestBody OrderRequest request) {
        return orderService.placeOrder(userId, request.getPhoneNumber(), request.getRegion(), request.getAddress(),
                request.getPostalCode());
    }

    @lombok.Data
    static class OrderRequest {
        private String phoneNumber;
        private String region;
        private String address;
        private String postalCode;
    }

    @GetMapping("/user/{userId}")
    public List<Order> getUserOrders(@PathVariable Long userId) {
        return orderService.getUserOrders(userId);
    }

    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PutMapping(value = "/{orderId}/status", consumes = "application/json")
    public Order updateStatus(@PathVariable Long orderId, @RequestBody java.util.Map<String, String> request) {
        String statusStr = request.get("status");
        System.out.println("Updating status for Order ID " + orderId + " to " + statusStr);
        try {
            com.farah.couture.entities.OrderStatus status = com.farah.couture.entities.OrderStatus.valueOf(statusStr);
            return orderService.updateStatus(orderId, status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + statusStr);
        }
    }

    @PostMapping("/fix-tracking-codes")
    public String fixTrackingCodes() {
        int count = orderService.fixAllTrackingCodes();
        return "Fixed tracking codes for " + count + " orders.";
    }

    @DeleteMapping("/{orderId}")
    @CrossOrigin(origins = "http://localhost:4200")
    public void deleteOrder(@PathVariable Long orderId) {
        System.out.println("Request received to delete Order ID: " + orderId);
        orderService.deleteOrder(orderId);
    }
}
