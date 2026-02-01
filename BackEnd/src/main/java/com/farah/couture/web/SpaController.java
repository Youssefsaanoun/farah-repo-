package com.farah.couture.web;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Forwards SPA routes to index.html so Angular handles client-side routing.
 * Lowest precedence so /api/** and static files are served first.
 */
@Controller
@Order(Ordered.LOWEST_PRECEDENCE)
public class SpaController {

    @RequestMapping(value = {
            "/",
            "/{path:[^\\.]*}",
            "/**/{path:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
