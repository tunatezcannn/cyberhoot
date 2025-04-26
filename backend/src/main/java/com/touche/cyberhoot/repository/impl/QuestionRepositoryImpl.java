package com.touche.cyberhoot.repository.impl;

import com.touche.cyberhoot.model.Question;
import com.touche.cyberhoot.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class QuestionRepositoryImpl implements QuestionRepository {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

    @Autowired
    AppUserRepositoryImpl appUserRepository;

    private final RowMapper<Question> questionMapper = (rs, rowNum) -> {
        Question question = Question.builder()
                .id(rs.getLong("id"))
                .question_type(rs.getString("question_type"))
                .question_text(rs.getString("question_text"))
                .correct(rs.getString("correct"))
                .question_lang(rs.getString("question_lang"))
                .question_options(rs.getString("question_options"))
                .topic(rs.getString("topic"))
                .difficulty(rs.getInt("difficulty"))
                .build();
        return question;
    };

    @Override
    public Question save(Question question) {
        if (question.getId() == null) {
            String sql = "INSERT INTO question (question_type, question_text, correct, question_lang, topic, difficulty, question_options) "
                    + "VALUES (:questionType, :questionText, :correct, :question_lang, :topic, :difficulty, :question_options)";

            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("questionType", question.getQuestionType())
                    .addValue("questionText", question.getQuestionText())
                    .addValue("correct", question.getCorrect())
                    .addValue("question_lang", question.getQuestionLang())
                    .addValue("topic", question.getTopic())
                    .addValue("difficulty", question.getDifficulty())
                    .addValue("question_options", question.getQuestionOptions());

            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});
            question.setId(keyHolder.getKey().longValue());
        } else {
            String sql = "UPDATE question "
                    + "SET question_type = :questionType, "
                    + "    question_text = :questionText, "
                    + "    correct = :correct, "
                    + "    question_lang = :question_lang, "
                    + "    topic = :topic, "
                    + "    difficulty = :difficulty, "
                    + "    question_options = :question_options "
                    + "WHERE id = :id";

            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("questionType", question.getQuestionType())
                    .addValue("questionText", question.getQuestionText())
                    .addValue("correct", question.getCorrect())
                    .addValue("question_lang", question.getQuestionLang())
                    .addValue("topic", question.getTopic())
                    .addValue("difficulty", question.getDifficulty())
                    .addValue("question_options", question.getQuestionOptions())
                    .addValue("id", question.getId());

            jdbcTemplate.update(sql, params);
        }

        return question;
    }

    @Override
    public Optional<Question> findById(Long id) {
        String sql = "SELECT * FROM question WHERE id = :id";
        MapSqlParameterSource params = new MapSqlParameterSource("id", id);

        try {
            Question q = jdbcTemplate.queryForObject(sql, params, questionMapper);
            return Optional.of(q);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
