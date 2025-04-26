package com.touche.cyberhoot.model;

import jakarta.persistence.*;
import lombok.Builder;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "quiz")
@Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_name", nullable = false, length = 100, columnDefinition= "TEXT")
    private String quiz_name;
    @Column(name = "quiz_description", nullable = false, length = 10000, columnDefinition= "TEXT")
    private String quiz_description;
    @Column(name = "quiz_lang", nullable = false, length = 100, columnDefinition= "TEXT")
    private String quiz_lang;
    @Column(name = "quiz_type", nullable = false, length = 100, columnDefinition= "TEXT")
    private String quiz_type;
    private Integer quiz_time_limit;
    private String quiz_topic;

    @ManyToOne
    @JoinColumn(name = "app_user_id", nullable = false)
    private AppUser appUser;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions;

    @Column(nullable = true, updatable = false)
    private Instant createdAt;

    @Column(nullable = true)
    private Instant updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuizName() {
        return quiz_name;
    }

    public void setQuizName(String quiz_name) {
        this.quiz_name = quiz_name;
    }

    public String getQuizDescription() {
        return quiz_description;
    }

    public void setQuizDescription(String quiz_description) {
        this.quiz_description = quiz_description;
    }

    public String getQuizLang() {
        return quiz_lang;
    }

    public void setQuizLang(String quiz_lang) {
        this.quiz_lang = quiz_lang;
    }

    public String getQuizType() {
        return quiz_type;
    }

    public void setQuizType(String quiz_type) {
        this.quiz_type = quiz_type;
    }

    public Integer getQuizTimeLimit() {
        return quiz_time_limit;
    }

    public void setQuizTimeLimit(Integer quiz_time_limit) {
        this.quiz_time_limit = quiz_time_limit;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    public AppUser getAppUser() {
        return appUser;
    }

    public void setAppUser(AppUser appUser) {
        this.appUser = appUser;
    }

    public String getQuizTopic() {
        return quiz_topic;
    }

    public void setQuizTopic(String quiz_topic) {
        this.quiz_topic = quiz_topic;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
