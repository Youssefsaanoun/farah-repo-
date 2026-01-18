package com.farah.couture.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiRootController {
    @GetMapping("/api")
    public String ok() {
        return "API is running";
    }
}
