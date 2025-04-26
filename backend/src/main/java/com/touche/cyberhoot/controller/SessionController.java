package com.touche.cyberhoot.controller;

import com.touche.cyberhoot.dto.CreateSessionRequest;
import com.touche.cyberhoot.dto.JoinSessionRequest;
import com.touche.cyberhoot.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/ws/session")
public class SessionController {

    @Autowired
    SessionService sessionService;

    @PostMapping("/createSession")
    public Map<String, Object> createSession(@RequestBody CreateSessionRequest input) {
        return sessionService.createSession(input);
    }

    @PostMapping("/joinSession")
    public Map<String, Object> joinSession(@RequestBody JoinSessionRequest input) {
        return sessionService.joinSession(input);
    }
}
