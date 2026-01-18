package com.farah.couture.services.impl;

import com.farah.couture.entities.*;
import com.farah.couture.repositories.*;
import com.farah.couture.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.javamail.JavaMailSender;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private JavaMailSender mailSender;

    @Override
    @Transactional
    public Order placeOrder(Long userId, String phoneNumber, String region, String address, String postalCode) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(cart.getUser());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setPhoneNumber(phoneNumber);
        order.setRegion(region);
        order.setAddress(address);
        order.setPostalCode(postalCode);

        // Generate random unique code (Uppercase 9 chars)
        order.setTrackingCode(generateTrackingCode());

        List<OrderLine> orderLines = new ArrayList<>();
        double totalAmount = 0.0;

        for (CartItem item : cart.getItems()) {
            OrderLine line = new OrderLine();
            line.setOrder(order);
            line.setVariant(item.getVariant());
            line.setQuantity(item.getQuantity());
            line.setPrice(item.getVariant().getProduct().getPrice()); // Assuming price is on Product

            totalAmount += line.getPrice() * line.getQuantity();
            orderLines.add(line);
        }

        order.setOrderLines(orderLines);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return savedOrder;
    }

    private String generateTrackingCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        StringBuilder randomCodeBuilder = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 9; i++) {
            randomCodeBuilder.append(characters.charAt(random.nextInt(characters.length())));
        }
        return randomCodeBuilder.toString();
    }

    @Override
    @Transactional
    public List<Order> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        orders.forEach(this::ensureTrackingCode);
        return orders;
    }

    @Override
    public Order getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null)
            ensureTrackingCode(order);
        return order;
    }

    @Override
    @Transactional
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        orders.forEach(this::ensureTrackingCode);
        return orders;
    }

    private void ensureTrackingCode(Order order) {
        if (order.getTrackingCode() == null || order.getTrackingCode().isEmpty()) {
            order.setTrackingCode(generateTrackingCode());
            orderRepository.save(order);
        }
    }

    @Override
    @Transactional
    public Order updateStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null) {
            order.setStatus(status);
            Order savedOrder = orderRepository.save(order);

            // Send email notification
            sendOrderStatusEmail(savedOrder, status);

            return savedOrder;
        }
        return null;
    }

    private void sendOrderStatusEmail(Order order, OrderStatus status) {
        if (order.getUser() == null || order.getUser().getEmail() == null) {
            return;
        }

        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, true, "UTF-8");

            helper.setFrom("faracontact111@gmail.com");
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Farah Couture: Mise à jour de votre commande #" + order.getTrackingCode());

            String statusMessage = "";
            String statusColor = "#000000";
            String logoGoldColor = "#C5A059"; // Gold color from logo

            switch (status) {
                case PENDING:
                    statusMessage = "Votre commande est en attente de confirmation.";
                    statusColor = "#d68910";
                    break;
                case ACCEPTED:
                    statusMessage = "Votre commande a été acceptée avec succès! Elle est en cours de préparation.";
                    statusColor = "#229954";
                    break;
                case SHIPPED:
                    statusMessage = "Excellente nouvelle! Votre commande a été expédiée et est en route.";
                    statusColor = "#2980b9";
                    break;
                case DELIVERED:
                    statusMessage = "Votre commande a été livrée. Nous espérons qu'elle vous plaira!";
                    statusColor = "#2c3e50";
                    break;
                case REJECTED:
                    statusMessage = "Nous sommes désolés, votre commande n'a pas pu être traitée et a été annulée.";
                    statusColor = "#c0392b";
                    break;
                case CANCELLED:
                    statusMessage = "Votre commande a été annulée comme demandé.";
                    statusColor = "#7f8c8d";
                    break;
                default:
                    statusMessage = "Le statut de votre commande est maintenant : " + status;
            }

            // Build Product List Rows
            StringBuilder itemsHtml = new StringBuilder();
            if (order.getOrderLines() != null) {
                for (OrderLine line : order.getOrderLines()) {
                    String productName = "Article";
                    String size = "-";
                    if (line.getVariant() != null && line.getVariant().getProduct() != null) {
                        productName = line.getVariant().getProduct().getName();
                        size = line.getVariant().getSize();
                    }
                    itemsHtml.append("<tr>")
                            .append("<td style='padding: 10px; border-bottom: 1px solid #eee;'>").append(productName)
                            .append("</td>")
                            .append("<td style='padding: 10px; border-bottom: 1px solid #eee; text-align: center;'>")
                            .append(size).append("</td>")
                            .append("<td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>x")
                            .append(line.getQuantity()).append("</td>")
                            .append("<td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>")
                            .append(String.format("%.3f", line.getPrice())).append(" TND</td>")
                            .append("</tr>");
                }
            }

            String htmlContent = String.format(
                    "<!DOCTYPE html>" +
                            "<html lang=\"fr\">" +
                            "<head>" +
                            "<link href=\"https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;500&display=swap\" rel=\"stylesheet\">"
                            +
                            "</head>" +
                            "<body style=\"font-family: 'Roboto', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f4f4f4;\">"
                            +
                            "  <table cellpadding=\"0\" cellspacing=\"0\" width=\"100%%\" style=\"background-color: #ffffff; margin-top: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\">"
                            +
                            "    <tr>" +
                            "      <td style=\"background-color: #fcf8f3; padding: 40px; text-align: center; border-bottom: 3px solid %s;\">"
                            + // Lighter bg for logo
                            "        <img src='cid:logoImage' alt='Farah Couture' style='max-width: 180px; height: auto;'/>"
                            +
                            "      </td>" +
                            "    </tr>" +
                            "    <tr>" +
                            "      <td style=\"padding: 40px 30px;\">" +
                            "        <h2 style=\"color: %s; margin-top: 0; font-family: 'Playfair Display', serif; font-size: 24px;\">Mise à jour du statut</h2>"
                            +
                            "        <p style=\"font-size: 16px; margin-bottom: 25px;\">Bonjour <strong>%s</strong>,</p>"
                            +
                            "        <div style=\"background-color: #f8f9fa; border-left: 4px solid %s; padding: 20px; margin-bottom: 30px;\">"
                            +
                            "            <p style=\"font-size: 18px; margin: 0; color: #2c3e50;\">%s</p>" +
                            "        </div>" +

                            // Order Details Section
                            "        <div style=\"margin-bottom: 30px;\">" +
                            "          <h3 style=\"font-family: 'Playfair Display', serif; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;\">Détails de la commande</h3>"
                            +
                            "          <table width=\"100%%\" style=\"font-size: 14px; border-collapse: collapse;\">" +
                            "            <thead>" +
                            "              <tr style=\"background-color: #f9f9f9; color: #666;\">" +
                            "                <th style=\"padding: 10px; text-align: left;\">Article</th>" +
                            "                <th style=\"padding: 10px; text-align: center;\">Taille</th>" +
                            "                <th style=\"padding: 10px; text-align: right;\">Qté</th>" +
                            "                <th style=\"padding: 10px; text-align: right;\">Prix</th>" +
                            "              </tr>" +
                            "            </thead>" +
                            "            <tbody>" +
                            "              %s" + // Items rows
                            "            </tbody>" +
                            "          </table>" +
                            "        </div>" +

                            "        <div style=\"border-top: 2px solid #eee; padding-top: 20px; margin-bottom: 30px;\">"
                            +
                            "          <table width=\"100%%\">" +
                            "            <tr>" +
                            "              <td style=\"padding: 5px 0; color: #666;\">Numéro de commande:</td>" +
                            "              <td style=\"padding: 5px 0; font-weight: 500; text-align: right;\">%s</td>"
                            +
                            "            </tr>" +
                            "            <tr>" +
                            "              <td style=\"padding: 5px 0; color: #666; font-size: 16px;\"><strong>Montant Total:</strong></td>"
                            +
                            "              <td style=\"padding: 5px 0; font-weight: 700; text-align: right; font-size: 18px; color: %s;\">%.3f TND</td>"
                            +
                            "            </tr>" +
                            "          </table>" +
                            "        </div>" +

                            "        <p style=\"font-size: 14px; color: #666; margin-top: 20px; text-align: center;\">Merci de votre confiance.</p>"
                            +
                            "      </td>" +
                            "    </tr>" +
                            "    <tr>" +
                            "      <td style=\"background-color: #f4f4f4; padding: 20px; text-align: center; color: #999; font-size: 12px;\">"
                            +
                            "        <p style=\"margin: 0;\">&copy; 2025 Farah Couture. Tous droits réservés.</p>" +
                            "      </td>" +
                            "    </tr>" +
                            "  </table>" +
                            "</body>" +
                            "</html>",
                    logoGoldColor,
                    logoGoldColor,
                    order.getUser().getFirstName(),
                    statusColor,
                    statusMessage,
                    itemsHtml.toString(),
                    order.getTrackingCode(),
                    statusColor,
                    order.getTotalAmount());

            helper.setText(htmlContent, true);

            // Add the inline logo - IMPORTANT: Use .jpg since that's what we have
            org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource(
                    "logo.jpg");
            if (resource.exists()) {
                helper.addInline("logoImage", resource);
            } else {
                System.err.println("Logo image logo.jpg not found in resources!");
            }

            mailSender.send(message);
            System.out.println("Status update email sent to " + order.getUser().getEmail());

        } catch (Exception e) {
            System.err.println("Failed to send status update email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    @Transactional
    public int fixAllTrackingCodes() {
        List<Order> orders = orderRepository.findAll();
        int fixedCount = 0;
        for (Order order : orders) {
            if (order.getTrackingCode() == null || order.getTrackingCode().isEmpty()) {
                order.setTrackingCode(generateTrackingCode());
                orderRepository.save(order);
                fixedCount++;
            }
        }
        return fixedCount;
    }

    @Override
    public void deleteOrder(Long orderId) {
        orderRepository.deleteById(orderId);
    }
}
