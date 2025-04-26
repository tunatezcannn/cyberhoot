package com.touche.cyberhoot.model;

import com.touche.cyberhoot.constants.Enums;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "game_sessions")
public class GameSession {

    @Id
    private String id;
    private String code;
    private String hostId;

    @Enumerated(EnumType.STRING)
    private Enums.SessionStatus status;

    @OneToMany(mappedBy = "gameSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Player> players;

    private String topic;
    private String questionType;
    private int currentQuestionIndex;
    private Long startTime;
    private Long endTime;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getHostId() { return hostId; }
    public void setHostId(String hostId) { this.hostId = hostId; }
    public Enums.SessionStatus getStatus() { return status; }
    public void setStatus(Enums.SessionStatus status) { this.status = status; }
    public List<Player> getPlayers() { return players; }
    public void setPlayers(List<Player> players) { this.players = players; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public int getCurrentQuestionIndex() { return currentQuestionIndex; }
    public void setCurrentQuestionIndex(int currentQuestionIndex) { this.currentQuestionIndex = currentQuestionIndex; }
    public Long getStartTime() { return startTime; }
    public void setStartTime(Long startTime) { this.startTime = startTime; }
    public Long getEndTime() { return endTime; }
    public void setEndTime(Long endTime) { this.endTime = endTime; }
}
