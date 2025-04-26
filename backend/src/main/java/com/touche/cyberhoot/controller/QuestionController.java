package com.touche.cyberhoot.controller;

import com.touche.cyberhoot.dto.GetExplanationRequest;
import com.touche.cyberhoot.dto.GetQuestionRequest;
import com.touche.cyberhoot.dto.GetSessionQuestionRequest;
import com.touche.cyberhoot.dto.SubmitAnswerRequest;
import com.touche.cyberhoot.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ws/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @PostMapping("/getQuestions")
    public List<Map<String, Object>> getQuestions(@RequestBody GetQuestionRequest input) {
        return questionService.getQuestions(input);
    }

    @PostMapping("/submitAnswer")
    public Map<String, Object> submitAnswer(@RequestBody SubmitAnswerRequest input) {
        return questionService.submitAnswer(input);
    }

    @PostMapping("/getExplanation")
    public Map<String, Object> getExplanation(@RequestBody GetExplanationRequest input) {
        return questionService.getExplanation(input);
    }

    @PostMapping("/getSessionQuestions")
    public List<Map<String, Object>> getSessionQuestions(@RequestBody GetSessionQuestionRequest input) {
        return questionService.getSessionQuestions(input);
    }
}
