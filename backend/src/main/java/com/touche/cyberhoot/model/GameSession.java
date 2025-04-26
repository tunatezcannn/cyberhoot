package com.touche.cyberhoot.model;

import com.touche.cyberhoot.constants.Enums;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "game_sessions")
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;

    @OneToOne
    @JoinColumn(name = "host_id", referencedColumnName = "id")
    private AppUser host;

    @Enumerated(EnumType.STRING)
    private Enums.SessionStatus status;

    @OneToMany(mappedBy = "gameSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AppUser> players;

    private Integer count;
    private String topic;
    private String questionType;
    private Long startTime;
    private Long endTime;

    @OneToMany(mappedBy = "gameSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions;

    public List<Question> getQuestions() {
        return questions;
    }
    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public AppUser getHost() {
        return host;
    }

    public void setHost(AppUser host) {
        this.host = host;
    }

    public Enums.SessionStatus getStatus() {
        return status;
    }

    public void setStatus(Enums.SessionStatus status) {
        this.status = status;
    }

    public List<AppUser> getPlayers() {
        return players;
    }

    public void setPlayers(List<AppUser> players) {
        this.players = players;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public Long getStartTime() {
        return startTime;
    }

    public void setStartTime(Long startTime) {
        this.startTime = startTime;
    }

    public Long getEndTime() {
        return endTime;
    }

    public void setEndTime(Long endTime) {
        this.endTime = endTime;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}
