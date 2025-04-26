package com.touche.cyberhoot.dto;

import lombok.Data;

@Data
public class SubmitAnswerRequest {
    private Long questionId;
    private String userAnswer;
    private String userName;

    public Long getQuestionId() {
        return questionId;
    }
    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getUserAnswer() {
        return userAnswer;
    }
    public void setUserAnswer(String userAnswer) {
        this.userAnswer = userAnswer;
    }

    public String getUserName() {
        return userName;
    }
    public void setUserName(String userName) {
        this.userName = userName;
    }
}
