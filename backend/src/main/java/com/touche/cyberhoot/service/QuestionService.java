package com.touche.cyberhoot.service;

import com.touche.cyberhoot.utils.OpenAPIUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class QuestionService {

    @Autowired
    private OpenAPIUtils openAPIUtils;

    public Map<String, Object> getQuestions() {
        Map<String, Object> questions = new HashMap<>();
        return questions;
    }

    public Map<String, Object> submitQuestions() {
        Map<String, Object> response = new HashMap<>();
        return response;
    }


}
