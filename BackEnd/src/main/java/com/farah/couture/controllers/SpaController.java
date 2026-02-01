package com.farah.couture.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Handle root path explicitly
    @RequestMapping(value = "/")
    public String index() {
        return "forward:/index.html";
    }

    // Handle top-level routes (e.g. /login, /about)
    @RequestMapping(value = "/{path:[^\\.]*}")
    public String redirect() {
        return "forward:/index.html";
    }

    // Handle nested routes (e.g. /products/123)
    @RequestMapping(value = "/**/{path:[^\\.]*}")
    public String redirectNested() {
        return "forward:/index.html";
    }
}
