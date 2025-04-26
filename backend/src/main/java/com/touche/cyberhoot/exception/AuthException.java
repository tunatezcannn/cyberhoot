package com.touche.cyberhoot.exception;

public class AuthException extends RuntimeException {
    private final String errorCode;

    public AuthException(String errorCode) {
        super(errorCode);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
