package com.touche.cyberhoot.service;

import com.touche.cyberhoot.dto.LoginRequest;
import com.touche.cyberhoot.dto.LoginResponse;
import com.touche.cyberhoot.dto.RegisterRequest;
import com.touche.cyberhoot.dto.RegisterResponse;
import com.touche.cyberhoot.exception.AuthException;
import com.touche.cyberhoot.model.AppUser;
import com.touche.cyberhoot.repository.impl.AppUserRepositoryImpl;
import com.touche.cyberhoot.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private AppUserRepositoryImpl userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public LoginResponse login(LoginRequest loginRequest) {
        try {
            AppUser user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new AuthException("USER NOT FOUND"));

            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                throw new AuthException("INVALID PASSWORD");
            }
            String token = jwtUtil.createJWTToken(user.getUsername());

            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setToken(token);
            loginResponse.setUserName(user.getUsername());
            loginResponse.setHttpStatus(HttpStatus.OK.value());

            return loginResponse;
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthException("UNKNOWN ERROR");
        }
    }

    public LoginResponse loginWithToken(String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String userName = jwtUtil.extractUsername(token);
                boolean isValidated = jwtUtil.validateJwtToken(token, userName);
                if (isValidated) {
                    LoginResponse loginResponse = new LoginResponse();
                    loginResponse.setToken(token);
                    loginResponse.setUserName(userName);
                    loginResponse.setHttpStatus(HttpStatus.OK.value());
                    return loginResponse;
                } else {
                    throw new AuthException("INVALID TOKEN");
                }
            }
            throw new AuthException("AUTHORIZATION HEADER NOT FOUND OR INVALID FORMAT");
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthException("UNKNOWN ERROR");
        }
    }

    public RegisterResponse register(RegisterRequest registerRequest) {
        try {
            if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
                throw new AuthException("USERNAME ALREADY EXISTS");
            }
            AppUser user = new AppUser();
            user.setUsername(registerRequest.getUsername());
            user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            user.setEmail(registerRequest.getEmail());
            userRepository.save(user);

            RegisterResponse registerResponse = new RegisterResponse();
            registerResponse.setUserName(user.getUsername());
            registerResponse.setHttpStatus(HttpStatus.CREATED.value());

            return registerResponse;
        } catch (Exception e) {
            throw new AuthException("UNKNOWN ERROR");
        }
    }
}
