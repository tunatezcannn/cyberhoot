package com.touche.cyberhoot.config;

import com.touche.cyberhoot.dto.GeneralErrorResponse;
import com.touche.cyberhoot.exception.AuthException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<GeneralErrorResponse> handleAuthException(AuthException ex) {
        GeneralErrorResponse responseDTO = new GeneralErrorResponse();
        responseDTO.setErrorMessage(ex.getMessage());
        responseDTO.setHttpStatus(HttpStatus.UNAUTHORIZED.value());
        return new ResponseEntity<>(responseDTO, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<GeneralErrorResponse> handleGeneralException(RuntimeException ex) {
        GeneralErrorResponse responseDTO = new GeneralErrorResponse();
        responseDTO.setErrorMessage(ex.getMessage());
        responseDTO.setHttpStatus(HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(responseDTO, HttpStatus.BAD_REQUEST);
    }
}
