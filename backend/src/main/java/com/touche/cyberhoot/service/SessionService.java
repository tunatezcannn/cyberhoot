package com.touche.cyberhoot.service;

import com.touche.cyberhoot.constants.Enums;
import com.touche.cyberhoot.dto.CreateSessionRequest;
import com.touche.cyberhoot.dto.GetQuestionRequest;
import com.touche.cyberhoot.dto.JoinSessionRequest;
import com.touche.cyberhoot.model.AppUser;
import com.touche.cyberhoot.model.GameSession;
import com.touche.cyberhoot.model.Question;
import com.touche.cyberhoot.repository.AppUserRepository;
import com.touche.cyberhoot.repository.QuestionRepository;
import com.touche.cyberhoot.repository.SessionRepository;
import com.touche.cyberhoot.repository.impl.AppUserRepositoryImpl;
import com.touche.cyberhoot.utils.CodeGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SessionService {

    @Autowired
    private AppUserRepositoryImpl userRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private SessionRepository sessionRepository;

    public Map<String, Object> createSession(CreateSessionRequest input) {
        String username = input.getUsername();
        if (username == null) {
            throw new IllegalArgumentException("Username is required to create a session.");
        }

        Optional<AppUser> optionalUser = appUserRepository.findByUsername(username);
        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("User not found with username: " + username);
        }
        AppUser host = optionalUser.get();

        GameSession gameSession = new GameSession();
        gameSession.setHost(host);

        String sessionCode = CodeGenerator.generateRandomCode();
        gameSession.setCode(sessionCode);

        gameSession.setStatus(Enums.SessionStatus.WAITING);
        gameSession.setTopic(input.getTopic());
        gameSession.setCount(input.getCount());
        gameSession.setQuestionType(input.getQuestionType());
        gameSession.setStartTime(System.currentTimeMillis());
        gameSession.setEndTime(null);

        gameSession.setPlayers(new ArrayList<>());
        gameSession.getPlayers().add(host);
        GameSession savedSession = sessionRepository.save(gameSession);

        GetQuestionRequest questionRequest = new GetQuestionRequest();
        questionRequest.setDifficulty(input.getDifficulty());
        questionRequest.setType(input.getQuestionType());
        questionRequest.setLanguage(input.getLanguage());
        questionRequest.setTopic(input.getTopic());
        questionRequest.setCount(input.getCount());

        List<Map<String, Object>> questions = questionService.getQuestions(questionRequest);

        for (Map<String, Object> questionData : questions) {
            Long questionId = (Long) questionData.get("id");
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new IllegalArgumentException("Question not found with ID: " + questionId));
            question.setGameSession(savedSession);
            questionRepository.save(question);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", savedSession.getId());
        response.put("code", savedSession.getCode());
        response.put("host", savedSession.getHost().getUsername());
        response.put("status", savedSession.getStatus());
        response.put("topic", savedSession.getTopic());
        response.put("questionType", savedSession.getQuestionType());
        response.put("questions", questions);

        return response;
    }

    public Map<String, Object> joinSession(JoinSessionRequest input) {
        String sessionCode = input.getSessionCode();
        String username = input.getUserName();

        if (sessionCode == null || username == null) {
            throw new IllegalArgumentException("Session code and username are required to join a session.");
        }

        Optional<GameSession> optionalSession = sessionRepository.findByCode(sessionCode);
        if (optionalSession.isEmpty()) {
            throw new IllegalArgumentException("Session not found with code: " + sessionCode);
        }

        GameSession gameSession = optionalSession.get();
        AppUser user = appUserRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));

        gameSession.getPlayers().add(user);
        sessionRepository.save(gameSession);

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", gameSession.getId());
        response.put("code", gameSession.getCode());
        response.put("host", gameSession.getHost().getUsername());
        response.put("status", gameSession.getStatus());
        response.put("topic", gameSession.getTopic());
        response.put("questionType", gameSession.getQuestionType());

        return response;
    }
}
