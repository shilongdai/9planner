package net.viperfish.planner.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class UIController {

    @RequestMapping("/")
    public String mainPage() {
        return "index";
    }

}
