package com.touche.cyberhoot.repository.impl;

import com.touche.cyberhoot.constants.Enums;
import com.touche.cyberhoot.model.GameSession;
import com.touche.cyberhoot.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class SessionRepositoryImpl implements SessionRepository {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;
    @Autowired
    private AppUserRepositoryImpl appUserRepository;

    private final RowMapper<GameSession> sessionRowMapper = (rs, rowNum) -> {
        GameSession session = new GameSession();
        session.setId(rs.getLong("id"));
        session.setCode(rs.getString("code"));
        session.setStatus(Enums.SessionStatus.valueOf(rs.getString("status")));
        session.setTopic(rs.getString("topic"));
        session.setQuestionType(rs.getString("question_type"));
        session.setStartTime(rs.getLong("start_time"));
        session.setEndTime(rs.getLong("end_time"));
        session.setHost(appUserRepository
                .findById(rs.getLong("host_id"))
                .orElse(null));
        return session;
    };

    @Override
    public GameSession save(GameSession gameSession) {
        String sql = """
            INSERT INTO game_sessions
              (code, host_id, status, topic, question_type, start_time, end_time)
            VALUES
              (:code, :hostId, :status, :topic, :questionType, :startTime, :endTime)
            ON DUPLICATE KEY UPDATE
              code          = VALUES(code),
              host_id       = VALUES(host_id),
              status        = VALUES(status),
              topic         = VALUES(topic),
              question_type = VALUES(question_type),
              start_time    = VALUES(start_time),
              end_time      = VALUES(end_time)
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("code", gameSession.getCode())
                .addValue("hostId",
                        gameSession.getHost() != null
                                ? gameSession.getHost().getId()
                                : null)
                .addValue("status", gameSession.getStatus().name())
                .addValue("topic", gameSession.getTopic())
                .addValue("questionType", gameSession.getQuestionType())
                .addValue("startTime", gameSession.getStartTime())
                .addValue("endTime", gameSession.getEndTime());

        jdbcTemplate.update(sql, params);
        return gameSession;
    }

    @Override
    public Optional<GameSession> findByCode(String code) {
        String sql = "SELECT * FROM game_sessions WHERE code = :code";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("code", code);

        try {
            GameSession session = jdbcTemplate.queryForObject(
                    sql, params, sessionRowMapper);
            return Optional.ofNullable(session);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<GameSession> findById(Long id) {
        String sql = "SELECT * FROM game_sessions WHERE id = :id";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("id", id);

        try {
            GameSession session = jdbcTemplate.queryForObject(
                    sql, params, sessionRowMapper);
            return Optional.ofNullable(session);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public void deleteById(Long id) {
        String sql = "DELETE FROM game_sessions WHERE id = :id";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("id", id);

        jdbcTemplate.update(sql, params);
    }
}
