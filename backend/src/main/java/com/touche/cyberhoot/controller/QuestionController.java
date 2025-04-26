package com.touche.cyberhoot.controller;

import com.touche.cyberhoot.service.QuestionService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ws/questions")
public class QuestionController {

    private final QuestionService qs;

    public QuestionController(QuestionService qs) {
        this.qs = qs;
    }

    @PostMapping("/getQuestions")
    public Map<String, Object> getQuestions(@RequestBody Map<String, Object> input) {
        return qs.getQuestions(input);
    }

    @PostMapping("/submitQuestions")
    public Map<String, Object> submitQuestion(@RequestBody Map<String, Object> input) {
        return qs.submitQuestions(input);
    }
}
