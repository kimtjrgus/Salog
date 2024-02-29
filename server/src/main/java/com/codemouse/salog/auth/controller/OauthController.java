package com.codemouse.salog.auth.controller;

import com.codemouse.salog.auth.service.OauthService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/members")
@Validated
@AllArgsConstructor
@Slf4j
public class OauthController {
    private final OauthService oauthService;

    @GetMapping("/login/oauth2/code/google")
    public ResponseEntity<?> googleOauth2Callback(@RequestParam("code") String authCode) {
        try {
            String accessToken = oauthService.getAccessToken(authCode);
            String email = oauthService.getUserEmail(accessToken); // 액세스 토큰으로 이메일 정보 가져오기

            Map<String, String> tokens = oauthService.oauthUserHandler(email); // JWT 생성

            return ResponseEntity.ok().body(tokens); // JWT 반환
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to get JWT");
        }
    }
}
