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

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
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
                    .createdAt(rs.getTimestamp("created_at").toInstant())
                    .build();

    @Override
    public QuestionAnswer save(QuestionAnswer qa) {
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("questionId", qa.getQuestion().getId())
                .addValue("userAnswer", qa.getUserAnswer())
                .addValue("score", qa.getScore())
                .addValue("correct", qa.getCorrect())
                .addValue("createdAt", Timestamp.from(Instant.now()))
                .addValue("updatedAt", Timestamp.from(Instant.now()));

        if (qa.getId() == null) {
            String sql = ""
                    + "INSERT INTO question_answers "
                    + "(question_id, user_answer, score, correct, updated_at, created_at) "
                    + "VALUES (:questionId, :userAnswer, :score, :correct, :updatedAt, :createdAt)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});
            qa.setId(keyHolder.getKey().longValue());
        } else {
            params.addValue("id", qa.getId());
            String sql = ""
                    + "UPDATE question_answers "
                    + "SET question_id = :questionId, "
                    + "user_answer = :userAnswer, "
                    + "score       = :score, "
                    + "correct     = :correct, "
                    + "updated_at  = :updatedAt "
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

    @Override
    public Optional<QuestionAnswer> findByQuestionId(Long questionId) {
        String sql = "SELECT * FROM question_answers WHERE question_id = :questionId";
        MapSqlParameterSource params = new MapSqlParameterSource("questionId", questionId);
        try {
            QuestionAnswer questionAnswer = jdbcTemplate.queryForObject(sql, params, questionAnswerMapper);
            return Optional.ofNullable(questionAnswer);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
