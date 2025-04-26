package com.touche.cyberhoot.repository.impl;

import com.touche.cyberhoot.model.AppUser;
import com.touche.cyberhoot.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class AppUserRepositoryImpl implements AppUserRepository {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public AppUserRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

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
        String sql = "SELECT * FROM app_user WHERE username = ?";
        try {
            AppUser user = jdbcTemplate.queryForObject(sql, appUserRowMapper, username);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<AppUser> findAll() {
        String sql = "SELECT * FROM app_user";
        return jdbcTemplate.query(sql, appUserRowMapper);
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
        INSERT INTO app_user
          (id, username, email, password)
        VALUES (?, ?, ?, ?)
        """;

        jdbcTemplate.update(sql,
                appUser.getId(),
                appUser.getUsername(),
                appUser.getEmail(),
                appUser.getPassword()
        );

        return appUser;
    }


    private AppUser update(AppUser appUser) {
        String sql = "UPDATE app_user SET username = ?, password = ?, " +
                "email = ?  WHERE id = ?";

        jdbcTemplate.update(sql,
                appUser.getUsername(),
                appUser.getPassword(),
                appUser.getEmail(),
                appUser.getId());

        return appUser;
    }

    @Override
    public void deleteById(Long id) {
        String sql = "DELETE FROM app_user WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    @Override
    public Optional<AppUser> findById(Long id) {
        String sql = "SELECT * FROM app_user WHERE id = ?";
        try {
            AppUser user = jdbcTemplate.queryForObject(sql, appUserRowMapper, id);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
