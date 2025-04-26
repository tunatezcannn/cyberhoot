package com.touche.cyberhoot.repository;

import org.springframework.stereotype.Repository;
import com.touche.cyberhoot.model.Quiz;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository {
    Quiz save(Quiz quiz);
    Optional<Quiz> findById(Long id);
    List<Quiz> findAll();
    void deleteById(Long id);
    List<Quiz> findByAppUserId(Long appUserId);
}
