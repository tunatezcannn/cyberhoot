package com.touche.cyberhoot.repository;

import com.touche.cyberhoot.model.AppUser;
import com.touche.cyberhoot.model.GameSession;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SessionRepository {
    GameSession save(GameSession gameSession);
    Optional<GameSession> findById(Long id);
    void deleteById(Long id);
    Optional<GameSession> findByCode(String code);
}
