package com.touche.cyberhoot.repository;

import com.touche.cyberhoot.model.Question;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuestionRepository {
    Question save(Question question);
    Optional<Question> findById(Long id);
}
