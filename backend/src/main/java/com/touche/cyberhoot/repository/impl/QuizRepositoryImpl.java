package com.touche.cyberhoot.repository.impl;

import com.touche.cyberhoot.model.Quiz;
import com.touche.cyberhoot.repository.QuizRepository;
import com.touche.cyberhoot.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class QuizRepositoryImpl implements QuizRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final QuestionRepository questionRepository;

    private final RowMapper<Quiz> quizMapper = (rs, rowNum) -> Quiz.builder()
            .id(rs.getLong("id"))
            .quiz_name(rs.getString("quiz_name"))
            .quiz_description(rs.getString("quiz_description"))
            .quiz_lang(rs.getString("quiz_lang"))
            .quiz_type(rs.getString("quiz_type"))
            .quiz_time_limit(rs.getInt("quiz_time_limit"))
            .quiz_topic(rs.getString("quiz_topic"))
            .createdAt(rs.getTimestamp("created_at").toInstant())
            .build();

    @Autowired
    public QuizRepositoryImpl(NamedParameterJdbcTemplate jdbcTemplate,
                              QuestionRepository questionRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.questionRepository = questionRepository;
    }

    @Override
    public Quiz save(Quiz quiz) {
        if (quiz.getId() == null) {
            String sql = "INSERT INTO quiz (quiz_name, quiz_description, quiz_lang, quiz_type, quiz_time_limit, app_user_id, created_at, updated_at, quiz_topic) " +
                    "VALUES (:quizName, :quizDescription, :quizLang, :quizType, :quizTimeLimit, :appUserId, :createdAt, :updatedAt, :quizTopic)";
            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("quizName", quiz.getQuizName())
                    .addValue("quizDescription", quiz.getQuizDescription())
                    .addValue("quizLang", quiz.getQuizLang())
                    .addValue("quizType", quiz.getQuizType())
                    .addValue("appUserId", quiz.getAppUser().getId())
                    .addValue("quizTimeLimit", quiz.getQuizTimeLimit())
                    .addValue("createdAt", Timestamp.from(Instant.now()))
                    .addValue("updatedAt", Timestamp.from(Instant.now()))
                    .addValue("quizTopic", quiz.getQuizTopic());

            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});
            quiz.setId(keyHolder.getKey().longValue());
        } else {
            String sql = "UPDATE quiz SET quiz_name = :quizName, quiz_description = :quizDescription, " +
                    "quiz_lang = :quizLang, quiz_type = :quizType, quiz_time_limit = :quizTimeLimit, app_user_id=:appUserId ," +
                    "updatedAt = :updatedAt, quiz_topic=:quizTopic" +
                    " WHERE id = :id";
            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("quizName", quiz.getQuizName())
                    .addValue("quizDescription", quiz.getQuizDescription())
                    .addValue("quizLang", quiz.getQuizLang())
                    .addValue("appUserId", quiz.getAppUser().getId())
                    .addValue("quizType", quiz.getQuizType())
                    .addValue("quizTimeLimit", quiz.getQuizTimeLimit())
                    .addValue("updatedAt", Timestamp.from(Instant.now()))
                    .addValue("quizTopic", quiz.getQuizTopic())
                    .addValue("id", quiz.getId());

            jdbcTemplate.update(sql, params);
        }

        if (quiz.getQuestions() != null) {
            quiz.getQuestions().forEach(question -> {
                question.setQuiz(quiz);
                questionRepository.save(question);
            });
        }
        return quiz;
    }

    @Override
    public Optional<Quiz> findById(Long id) {
        String sql = "SELECT * FROM quiz WHERE id = :id";
        MapSqlParameterSource params = new MapSqlParameterSource("id", id);

        try {
            Quiz quiz = jdbcTemplate.queryForObject(sql, params, quizMapper);
            quiz.setQuestions(questionRepository.findByQuizId(id));
            return Optional.of(quiz);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<Quiz> findAll() {
        String sql = "SELECT * FROM quiz";
        List<Quiz> quizzes = jdbcTemplate.query(sql, quizMapper);

        quizzes.forEach(quiz ->
                quiz.setQuestions(questionRepository.findByQuizId(quiz.getId()))
        );

        return quizzes;
    }

    @Override
    public void deleteById(Long id) {
        String questionSql = "DELETE FROM question WHERE quiz_id = :quizId";
        jdbcTemplate.update(questionSql, new MapSqlParameterSource("quizId", id));

        String sql = "DELETE FROM quiz WHERE id = :id";
        jdbcTemplate.update(sql, new MapSqlParameterSource("id", id));
    }

    @Override
    public List<Quiz> findByAppUserId(Long appUserId) {
        String sql = "SELECT * FROM quiz WHERE app_user_id = :appUserId";
        MapSqlParameterSource params = new MapSqlParameterSource("appUserId", appUserId);
        List<Quiz> quizzes = jdbcTemplate.query(sql, params, quizMapper);

        quizzes.forEach(quiz ->
                quiz.setQuestions(questionRepository.findByQuizId(quiz.getId()))
        );

        return quizzes;
    }
}