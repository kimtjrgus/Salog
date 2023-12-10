package com.codemouse.salog.auth.jwt;

import com.codemouse.salog.exception.BusinessLogicException;
import com.codemouse.salog.exception.ExceptionCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.*;

@Getter
public class JwtTokenizer {
    @Value("${jwt.key}")
    private String secretKey;

    @Value("${jwt.access-token-expiration-minutes}")
    private int accessTokenExpirationMinutes;

    @Value("${jwt.refresh-token-expiration-minutes}")
    private int refreshTokenExpirationMinutes;

    // 시크릿키를 UTF-8 형식의 바이트로 변환, Base64 형식으로 인코딩
    public String encodeBase64SecretKey(String secretKey) {
        return Encoders.BASE64.encode(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    // 액세스 토큰 생성
    public String generateAccessToken(Map<String, Object> claims,
                                      String subject,
                                      Date expiration,
                                      String base64EncodeSecretKey) {
        Key key = getKeyFromBase64EncodedKey(base64EncodeSecretKey);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)    // 토큰 제목
                .setIssuedAt(Calendar.getInstance().getTime()) // 발급시간
                .setExpiration(expiration)  // 만료시간
                .signWith(key)  // 알고리즘, 시크릿키
                .compact();
    }

    // 리프레쉬 토큰 생성
    public String generateRefreshToken(String subject,
                                       Date expiration,
                                       String base64EncodeSecretKey) {
        Key key = getKeyFromBase64EncodedKey(base64EncodeSecretKey);

        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(Calendar.getInstance().getTime())
                .setExpiration(expiration)
                .signWith(key)
                .compact();
    }

    // 검증 이후, claims를 반환
    public Jws<Claims> getClaims(String jws, String base64EncodedSecretKey) {
        Key key = getKeyFromBase64EncodedKey(base64EncodedSecretKey);

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(jws);
    }

    // 검증만 진행
    public void verifySignature(String jws, String base64EncodedSecretKey) {
        Key key = getKeyFromBase64EncodedKey(base64EncodedSecretKey);

        Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(jws);
    }

    // 토큰 유효시간 얻기 위함
    public Date getTokenExpiration(int expirationMinutes) {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, expirationMinutes);

        return calendar.getTime();
    }

    // 인코딩된 시크릿키에서 디코드 후 HMAC SHA 알고리즘을 사용할 수 있는 키로 변환
    private Key getKeyFromBase64EncodedKey(String base64EncodeSecretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(base64EncodeSecretKey);

        return Keys.hmacShaKeyFor(keyBytes);
    }

    // 클레임에서 회원 id를 추출
    public Long getMemberId(String token) {
        if (token == null) {
            throw new BusinessLogicException(ExceptionCode.MEMBER_UNAUTHORIZED);
        } else {
            return Objects.requireNonNull(parseToken(token)).get("memberId", Long.class);
        }
    }

    // 토큰에서 클레임을 추출
    private Claims parseToken(String token) {
        Key key = getKeyFromBase64EncodedKey(encodeBase64SecretKey(secretKey));
        String jws = token.replace("Bearer ", "");
        Claims claims;

        try {
            claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(jws)
                    .getBody();
        }   catch (ExpiredJwtException e) {
            throw new BusinessLogicException(ExceptionCode.MEMBER_UNAUTHORIZED);
        }
        System.out.println(claims);
        return claims;
    }
}
