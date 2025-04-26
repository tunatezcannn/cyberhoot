package com.touche.cyberhoot.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GeneralErrorResponse {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String errorMessage;

    @JsonIgnore
    private int httpStatus;

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public void setHttpStatus(int httpStatus) {
        this.httpStatus = httpStatus;
    }
}

