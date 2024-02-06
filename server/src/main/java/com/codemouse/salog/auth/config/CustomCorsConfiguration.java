package com.codemouse.salog.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import javax.servlet.http.HttpServletRequest;

// cors 설정
@Configuration
public class CustomCorsConfiguration implements CorsConfigurationSource {
    @Override
    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:3000"); // 프론트 용
        configuration.addAllowedOrigin("http://salog-bucket.s3-website.ap-northeast-2.amazonaws.com"); // 프론트 S3
//        configuration.addAllowedOrigin("https://d37e9ewzht4md2.cloudfront.net"); // 클라우드 프론트 사용 시 활성화 필요
        configuration.addAllowedOrigin("http://www.salog.kro.kr"); // 도메인
        configuration.addAllowedMethod(HttpMethod.GET.name());
        configuration.addAllowedMethod(HttpMethod.POST.name());
        configuration.addAllowedMethod(HttpMethod.PUT.name());
        configuration.addAllowedMethod(HttpMethod.DELETE.name());
        configuration.addAllowedMethod(HttpMethod.PATCH.name());
        configuration.addAllowedMethod(HttpMethod.OPTIONS.name());
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        return configuration;
    }
}
