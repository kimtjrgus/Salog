package com.codemouse.salog.auth.controller;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@AllArgsConstructor
public class TokenController {
    private final JwtTokenizer jwtTokenizer;
    private final TokenBlackListService tokenBlackListService;

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> payload) {
        String oldRefreshToken = payload.get("refreshToken");

        tokenBlackListService.isBlackListed(oldRefreshToken);

        // 기존 Refresh 토큰의 유효성을 검사하고, 새로운 Access 토큰과 refresh 토큰을 생성
        Map<String, String> tokens = jwtTokenizer.tokenReissue(oldRefreshToken);

        // 기존 Refresh 토큰을 블랙리스트에 추가
        tokenBlackListService.addToBlackList(oldRefreshToken);

        return ResponseEntity.ok(tokens);
    }
}
