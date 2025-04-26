package com.touche.cyberhoot.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private SecretKey secretKey;
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 3;

    @Value("${jwt.secret}")
    private String secretString;

    @PostConstruct
    public void init() {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretString));
    }

    public JwtUtil() {

    }

    public String createJWTToken(String username) {
        long currentTime = System.currentTimeMillis();

        Map<String, Object> claims = new HashMap<>();
        claims.put("username", username);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(currentTime))
                .setExpiration(new Date(currentTime + EXPIRATION_TIME))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public Object extractClaim(String token, String claimKey) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.get(claimKey);
        } catch (Exception e) {
            return null;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateJwtToken(String token, String username) {
        try {
            Claims claims = extractAllClaims(token);
            String extractedUsername = claims.getSubject();
            Date expirationDate = claims.getExpiration();

            return extractedUsername.equals(username) && expirationDate.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }


}
