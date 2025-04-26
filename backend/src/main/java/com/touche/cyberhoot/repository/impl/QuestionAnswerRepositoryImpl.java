package com.touche.cyberhoot.repository.impl;

import com.touche.cyberhoot.model.QuestionAnswer;
import com.touche.cyberhoot.repository.QuestionAnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.dao.EmptyResultDataAccessException;

import java.util.Optional;

@Repository
public class QuestionAnswerRepositoryImpl implements QuestionAnswerRepository {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;
    @Autowired
    private QuestionRepositoryImpl questionRepository;

    private final RowMapper<QuestionAnswer> questionAnswerMapper = (rs, rowNum) ->
            QuestionAnswer.builder()
                    .id(rs.getLong("id"))
                    .question(
                            questionRepository.findById(rs.getLong("question_id"))
                                    .orElse(null)
                    )
                    .userAnswer(rs.getString("user_answer"))
                    .score(rs.getInt("score"))
                    .correct(rs.getBoolean("correct"))
                    .build();

    @Autowired
    public QuestionAnswerRepositoryImpl(NamedParameterJdbcTemplate jdbcTemplate,
                                        QuestionRepositoryImpl questionRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.questionRepository = questionRepository;
    }

    @Override
    public QuestionAnswer save(QuestionAnswer qa) {
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("questionId", qa.getQuestion().getId())
                .addValue("userAnswer", qa.getUserAnswer())
                .addValue("score", qa.getScore())
                .addValue("correct", qa.getCorrect());

        if (qa.getId() == null) {
            // INSERT + retrieve generated key
            String sql = ""
                    + "INSERT INTO question_answers "
                    + "(question_id, user_answer, score, correct) "
                    + "VALUES (:questionId, :userAnswer, :score, :correct)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(sql, params, keyHolder);
            Number key = keyHolder.getKey();
            if (key != null) {
                qa.setId(key.longValue());
            }
        } else {
            params.addValue("id", qa.getId());
            String sql = ""
                    + "UPDATE question_answers "
                    + "SET question_id = :questionId, "
                    + "user_answer = :userAnswer, "
                    + "score       = :score, "
                    + "correct     = :correct "
                    + "WHERE id = :id";
            jdbcTemplate.update(sql, params);
        }

        return qa;
    }

    @Override
    public Optional<QuestionAnswer> findById(Long id) {
        String sql = "SELECT * FROM question_answers WHERE id = :id";
        MapSqlParameterSource params = new MapSqlParameterSource("id", id);
        try {
            QuestionAnswer qa = jdbcTemplate.queryForObject(sql, params, questionAnswerMapper);
            return Optional.ofNullable(qa);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
