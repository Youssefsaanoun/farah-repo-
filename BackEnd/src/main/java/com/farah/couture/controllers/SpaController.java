package com.farah.couture.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Forward all non-api, non-static-file requests to index.html
    @RequestMapping(value = {
            "/login",
            "/register",
            "/profile",
            "/cart",
            "/admin/**",
            "/products", 
            "/products/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
