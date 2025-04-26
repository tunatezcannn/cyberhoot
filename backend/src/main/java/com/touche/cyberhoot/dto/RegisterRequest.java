package com.touche.cyberhoot.dto;

public class RegisterRequest {
    private String username;
    private String password;
    private String email;

    public String getPassword() {
        return password;
    }
    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }
}
