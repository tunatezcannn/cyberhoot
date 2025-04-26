package com.touche.cyberhoot.repository.impl;

import com.touche.cyberhoot.model.AppUser;
import com.touche.cyberhoot.repository.AppUserRepository;
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
public class AppUserRepositoryImpl implements AppUserRepository {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

    private final RowMapper<AppUser> appUserRowMapper = (rs, rowNum) -> {
        AppUser user = new AppUser();
        user.setId(rs.getLong("id"));
        user.setUsername(rs.getString("username"));
        user.setPassword(rs.getString("password"));
        user.setEmail(rs.getString("email"));
        return user;
    };

    @Override
    public Optional<AppUser> findByUsername(String username) {
        String sql = "SELECT * FROM app_user WHERE username = :username";
        MapSqlParameterSource params = new MapSqlParameterSource("username", username);
        try {
            AppUser user = jdbcTemplate.queryForObject(sql, params, appUserRowMapper);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<AppUser> findAll() {
        String sql = "SELECT * FROM app_user";
        return jdbcTemplate.query(sql, new MapSqlParameterSource(), appUserRowMapper);
    }

    @Override
    public AppUser save(AppUser appUser) {
        if (appUser.getId() == null) {
            return insert(appUser);
        } else {
            return update(appUser);
        }
    }

    private AppUser insert(AppUser appUser) {
        String sql = """
        INSERT INTO app_user (username, email, password, created_at, updated_at)
        VALUES (:username, :email, :password, :createdAt, :updatedAt)
        """;
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("username", appUser.getUsername())
                .addValue("email", appUser.getEmail())
                .addValue("password", appUser.getPassword())
                .addValue("createdAt", Timestamp.from(Instant.now()))
                .addValue("updatedAt", Timestamp.from(Instant.now()));

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});
        Number generatedId = keyHolder.getKey();
        if (generatedId != null) {
            appUser.setId(generatedId.longValue());
        }
        return appUser;
    }

    private AppUser update(AppUser appUser) {
        String sql = """
        UPDATE app_user
           SET username = :username,
               email = :email,
               password = :password,
               updated_at = :updatedAt
         WHERE id = :id
        """;
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("username", appUser.getUsername())
                .addValue("email", appUser.getEmail())
                .addValue("password", appUser.getPassword())
                .addValue("updatedAt", Timestamp.from(Instant.now()))
                .addValue("id", appUser.getId());

        jdbcTemplate.update(sql, params);
        return appUser;
    }

    @Override
    public void deleteById(Long id) {
        String sql = "DELETE FROM app_user WHERE id = :id";
        MapSqlParameterSource params = new MapSqlParameterSource("id", id);
        jdbcTemplate.update(sql, params);
    }

    @Override
    public Optional<AppUser> findById(Long id) {
        String sql = "SELECT * FROM app_user WHERE id = :id";
        MapSqlParameterSource params = new MapSqlParameterSource("id", id);
        try {
            AppUser user = jdbcTemplate.queryForObject(sql, params, appUserRowMapper);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
