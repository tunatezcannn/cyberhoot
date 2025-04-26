package com.touche.cyberhoot.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;

    public String getPassword() {
        return password;
    }
    public String getUsername() {
        return username;
    }
}
