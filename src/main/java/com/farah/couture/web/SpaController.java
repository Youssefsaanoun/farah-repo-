package com.farah.couture.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // 1) "/" home
    // 2) "/something" (no dot)
    // 3) "/something/**" (nested routes), excluding "/api/**" if you use that prefix
    @RequestMapping(value = {"/", "/{path:[^\\.]*}", "/{path:^(?!api$).*$}/**"})
    public String forward() {
        return "forward:/index.html";
    }
}
