package com.touche.cyberhoot.model;

import jakarta.persistence.*;
import lombok.Builder;

import java.util.List;

@Entity
@Table(name = "question")
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String question_type;
    @Lob
    @Column(nullable = false, name="question_text", length = 10000, columnDefinition = "TEXT")
    private String question_text;
    @Lob
    @Column(nullable = false, name="correct", length = 10000, columnDefinition = "TEXT")
    private String correct;

    @Lob
    @Column(nullable = true, name="question_options", length = 10000, columnDefinition = "TEXT")
    private String question_options;

    @ManyToOne
    @JoinColumn(name = "game_session_id", unique = true)
    private GameSession gameSession;

    private String question_lang;
    private String topic;
    private Integer difficulty;

    private Integer solving_time;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionAnswer> answers;

    public List<QuestionAnswer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<QuestionAnswer> answers) {
        this.answers = answers;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionType() {
        return question_type;
    }

    public void setQuestionType(String question_type) {
        this.question_type = question_type;
    }

    public String getQuestionText() {
        return question_text;
    }

    public void setQuestionText(String question_text) {
        this.question_text = question_text;
    }

    public String getCorrect() {
        return correct;
    }

    public void setCorrect(String correct) {
        this.correct = correct;
    }

    public String getQuestionLang() {
        return question_lang;
    }

    public void setQuestionLang(String question_lang) {
        this.question_lang = question_lang;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public Integer getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Integer difficulty) {
        this.difficulty = difficulty;
    }

    public String getQuestionOptions() {
        return question_options;
    }

    public void setQuestionOptions(String question_options) {
        this.question_options = question_options;
    }

    public GameSession getGameSession() {
        return gameSession;
    }

    public void setGameSession(GameSession gameSession) {
        this.gameSession = gameSession;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public Integer getSolvingTime() {
        return solving_time;
    }

    public void setSolvingTime(Integer solving_time) {
        this.solving_time = solving_time;
    }
}
