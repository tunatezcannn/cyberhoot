package com.touche.cyberhoot.dto;

import lombok.Data;

@Data
public class JoinSessionRequest {
    private String sessionCode;
    private String userName;

    public String getSessionCode() {
        return sessionCode;
    }

    public void setSessionCode(String sessionCode) {
        this.sessionCode = sessionCode;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
}
