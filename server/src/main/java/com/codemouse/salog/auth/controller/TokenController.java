package com.codemouse.salog.auth.controller;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import org.springframework.beans.factory.annotation.Autowired;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
public class TokenController {
    @Autowired
    private JwtTokenizer jwtTokenizer;
    @Autowired
    private TokenBlackListService tokenBlackListService;

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> payload) {
        String oldRefreshToken = payload.get("refreshToken");

        tokenBlackListService.isBlackListed(oldRefreshToken);

        // 기존 Refresh 토큰의 유효성을 검사하고, 새로운 Access 토큰을 생성
        String newAccessToken = jwtTokenizer.refreshToken(oldRefreshToken);

        // 기존 Refresh 토큰에서 클레임을 추출
        Claims claims = jwtTokenizer.getClaims(oldRefreshToken, jwtTokenizer.encodeBase64SecretKey(jwtTokenizer.getSecretKey())).getBody();

        // 새로운 Refresh 토큰을 생성
        String subject = claims.getSubject();
        Date expiration = jwtTokenizer.getTokenExpiration(jwtTokenizer.getRefreshTokenExpirationMinutes());
        String base64EncodeSecretKey = jwtTokenizer.encodeBase64SecretKey(jwtTokenizer.getSecretKey());
        String newRefreshToken = jwtTokenizer.generateRefreshToken(subject, expiration, base64EncodeSecretKey);


        // 기존 Refresh 토큰을 블랙리스트에 추가합니다.
        tokenBlackListService.addToBlackList(oldRefreshToken);

        // 새로 생성한 Access 토큰과 Refresh 토큰을 클라이언트에 보내줍니다.
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", "Bearer " + newAccessToken);
        tokens.put("refreshToken", newRefreshToken);
        return ResponseEntity.ok(tokens);
    }
}
