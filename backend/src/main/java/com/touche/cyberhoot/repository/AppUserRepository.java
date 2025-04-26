package com.touche.cyberhoot.repository;

import com.touche.cyberhoot.model.AppUser;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppUserRepository {
    Optional<AppUser> findByUsername(String username);
    List<AppUser> findAll();
    AppUser save(AppUser appUser);
    void deleteById(Long id);
    Optional<AppUser> findById(Long id);
}
