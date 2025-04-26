package com.touche.cyberhoot.controller;

import com.touche.cyberhoot.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ws/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @PostMapping("/getQuestions")
    public String getQuestions(@RequestBody Map<String, Object> input) {
        return "Received input: " + input.toString();
    }

    @PostMapping("/submitQuestions")
    public String submitQuestion(@RequestBody Map<String, Object> input) {
        return "Received input: " + input.toString();
    }
}
