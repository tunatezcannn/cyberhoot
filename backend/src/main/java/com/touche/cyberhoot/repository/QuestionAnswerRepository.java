package com.touche.cyberhoot.repository;

import com.touche.cyberhoot.model.Question;
import com.touche.cyberhoot.model.QuestionAnswer;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionAnswerRepository {
    QuestionAnswer save(QuestionAnswer questionAnswer);
    Optional<QuestionAnswer> findById(Long id);
    Optional<QuestionAnswer> findByQuestionId(Long questionId);
}
