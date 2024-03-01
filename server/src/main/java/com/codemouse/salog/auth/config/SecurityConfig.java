package com.codemouse.salog.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.SecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.DefaultSecurityFilterChain;

// HTTP -> HTTPS 리다이렉트
@Configuration
public class SecurityConfig extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http
                .requiresChannel()
                .requestMatchers(r -> r.getHeader("X-Forwarded-Proto") != null)
                .requiresSecure();
    }
}

