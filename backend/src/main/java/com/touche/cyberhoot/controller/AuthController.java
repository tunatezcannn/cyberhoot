package com.touche.cyberhoot.controller;

import com.touche.cyberhoot.dto.LoginRequest;
import com.touche.cyberhoot.dto.LoginResponse;
import com.touche.cyberhoot.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ws/auth")
public class AuthController {
    @Autowired
    AuthService authService;

    @RequestMapping(value = "/login", method = RequestMethod.POST)
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.status(response.getHttpStatus()).body(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<LoginResponse> loginWithToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        LoginResponse response =  authService.loginWithToken(authHeader);
        return ResponseEntity.status(response.getHttpStatus()).body(response);
    }
}
