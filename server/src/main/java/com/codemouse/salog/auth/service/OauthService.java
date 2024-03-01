package com.codemouse.salog.auth.service;

import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.auth.utils.CustomAuthorityUtils;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.repository.MemberRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Transactional
@Service
public class OauthService {
    private final MemberRepository memberRepository;
    private final CustomAuthorityUtils authorityUtils;
    private final JwtTokenizer jwtTokenizer;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String GOOGLE_CLIENT_ID;
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String GOOGLE_CLIENT_SECRET;
    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String REDIRECT_URL;

    public OauthService(MemberRepository memberRepository, CustomAuthorityUtils authorityUtils, JwtTokenizer jwtTokenizer) {
        this.memberRepository = memberRepository;
        this.authorityUtils = authorityUtils;
        this.jwtTokenizer = jwtTokenizer;
    }

    public String getAccessToken(String authCode) throws JsonProcessingException {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(new FormHttpMessageConverter());

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

        params.add("code", authCode);
        params.add("client_id", GOOGLE_CLIENT_ID);
        params.add("client_secret", GOOGLE_CLIENT_SECRET);
        params.add("redirect_uri", REDIRECT_URL);
        params.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request =
                new HttpEntity<>(params, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                "https://oauth2.googleapis.com/token",
                request,
                String.class
        );

        if (response.getStatusCode() == HttpStatus.OK) {
            // response.getBody()에는 액세스 토큰 정보가 JSON 형태로 포함
            // 이를 파싱하여 액세스 토큰을 추출
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response.getBody());

            return rootNode.get("access_token").asText();
        } else {
            // 토큰 요청이 실패한 경우 에러 메시지를 반환
            return "Failed to get access token";
        }
    }


    public String getUserEmail(String accessToken) throws JsonProcessingException {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                HttpMethod.GET,
                entity,
                String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response.getBody());

            return rootNode.get("email").asText();
        } else {
            return "Failed to get user email";
        }
    }

    //Oauth 회원 핸들링
    public Map<String, String> oauthUserHandler(String email) {

        Member oauthMember;

        if (verifiedEmail(email)) {
            oauthMember = memberRepository.findByEmail(email).get();
        } else {
            Member member = new Member();
            member.setEmail(email);
            member.setPassword(null);
            member.setHomeAlarm(false);
            member.setEmailAlarm(false);

            // 권한
            List<String> roles = authorityUtils.createRoles(member.getEmail());
            member.setRoles(roles);

            oauthMember = memberRepository.save(member);
        }

        // jwt 생성
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", oauthMember.getEmail());
        claims.put("roles", oauthMember.getRoles());
        claims.put("memberId", oauthMember.getMemberId());

        String subject = oauthMember.getEmail();

        String base64EncodedSecretKey = jwtTokenizer.encodeBase64SecretKey(jwtTokenizer.getSecretKey());

        Date accessTokenExpiration = jwtTokenizer.getTokenExpiration(jwtTokenizer.getAccessTokenExpirationMinutes());
        String accessToken = jwtTokenizer.generateAccessToken(claims, subject, accessTokenExpiration, base64EncodedSecretKey);

        Date refreshTokenExpiration = jwtTokenizer.getTokenExpiration(jwtTokenizer.getRefreshTokenExpirationMinutes());
        String refreshToken = jwtTokenizer.generateRefreshToken(subject, refreshTokenExpiration, base64EncodedSecretKey);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);

        return tokens;
    }

    // 존재하는 이메일인지 체크 (boolean)
    public boolean verifiedEmail(String email) {
        return memberRepository.existsByEmail(email);
    }
}
