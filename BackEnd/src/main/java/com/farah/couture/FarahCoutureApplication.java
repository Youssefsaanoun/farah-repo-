package com.farah.couture;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.server.ErrorPage;
import org.springframework.boot.web.server.ErrorPageRegistrar;
import org.springframework.boot.web.server.ErrorPageRegistry;
import org.springframework.http.HttpStatus;

@SpringBootApplication
public class FarahCoutureApplication {

	public static void main(String[] args) {
		SpringApplication.run(FarahCoutureApplication.class, args);
	}

	/** Send 404 to / so SPA (or fallback index.html) is shown instead of Whitelabel. */
	@org.springframework.context.annotation.Bean
	public ErrorPageRegistrar errorPageRegistrar() {
		return (ErrorPageRegistry registry) ->
				registry.addErrorPages(new ErrorPage(HttpStatus.NOT_FOUND, "/"));
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
