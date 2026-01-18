package com.farah.couture;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FarahCoutureApplication {

	public static void main(String[] args) {
		SpringApplication.run(FarahCoutureApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner run(com.farah.couture.services.OrderService orderService) {
		return args -> {
			System.out.println("Checking for orders without tracking codes...");
			java.util.List<com.farah.couture.entities.Order> orders = orderService.getAllOrders();
			System.out.println("Processed " + orders.size() + " orders for tracking code verification.");
		};
	}

}
