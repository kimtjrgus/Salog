package com.codemouse.salog.auth.config;

import com.codemouse.salog.auth.filter.JwtAuthenticationFilter;
import com.codemouse.salog.auth.filter.JwtVerificationFilter;
import com.codemouse.salog.auth.handler.MemberAccessDeniedHandler;
import com.codemouse.salog.auth.handler.MemberAuthenticationEntryPoint;
import com.codemouse.salog.auth.handler.MemberAuthenticationFailureHandler;
import com.codemouse.salog.auth.handler.MemberAuthenticationSuccessHandler;
import com.codemouse.salog.auth.jwt.JwtTokenizer;
import com.codemouse.salog.auth.utils.CustomAuthorityUtils;
import com.codemouse.salog.members.repository.MemberRepository;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity(debug = true)
@AllArgsConstructor
public class SecurityConfiguration implements WebMvcConfigurer {
    private final CustomAuthorityUtils authorityUtils;
    private final CustomCorsConfiguration corsConfiguration;
    private final MemberRepository memberRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .headers().frameOptions().sameOrigin()
                .and()

                .csrf().disable()
                .cors().configurationSource(corsConfiguration)
                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()

                .formLogin().disable()
                .httpBasic().disable()
                .exceptionHandling()
                .authenticationEntryPoint(new MemberAuthenticationEntryPoint())
                .accessDeniedHandler(new MemberAccessDeniedHandler())
                .and()

                .apply(new CustomFilterConfigurer())
                .and()

                // TODO: 2023-12-04 엔드포인트 수정 필요, 추후 구현 엔드포인트 추가시 수정 필요 
                .authorizeHttpRequests(authorize -> authorize
                        .antMatchers(HttpMethod.POST, "/members/signup").permitAll()
                        .antMatchers(HttpMethod.POST, "/members/login").permitAll()
                        .antMatchers(HttpMethod.GET, "/members/get").hasRole("USER")
                        .antMatchers(HttpMethod.DELETE, "/members/leaveid").hasRole("USER")
                        .antMatchers(HttpMethod.PATCH, "/members/update").hasRole("USER")
//                        .antMatchers(HttpMethod.POST, "/members/sendmail").permitAll()
//                        .antMatchers(HttpMethod.POST, "/members/findpassword/sendmail").permitAll()
//                        .antMatchers(HttpMethod.POST, "/members/nicknamecheck").permitAll()
//                        .antMatchers(HttpMethod.PATCH, "/members/findpassword").permitAll()
//                        .antMatchers(HttpMethod.PATCH, "/members/mypage/update").hasRole("USER")
//                        .antMatchers(HttpMethod.PATCH, "/members/mypage/passwordupdate").hasRole("USER")
//                        .antMatchers(HttpMethod.POST, "/members/emailcheck").permitAll()
                );
        return http.build();
    }

    // PasswordEncoder Beans 객체 생성
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public JwtTokenizer jwtTokenizer() {
        return new JwtTokenizer();
    }

    public class CustomFilterConfigurer extends AbstractHttpConfigurer<CustomFilterConfigurer, HttpSecurity> {
        @Override
        public void configure(HttpSecurity builder) throws Exception {
            AuthenticationManager authenticationManager = builder.getSharedObject(AuthenticationManager.class);

            JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(authenticationManager, jwtTokenizer(), memberRepository);
            jwtAuthenticationFilter.setFilterProcessesUrl("/members/login");
            jwtAuthenticationFilter.setAuthenticationSuccessHandler(new MemberAuthenticationSuccessHandler());
            jwtAuthenticationFilter.setAuthenticationFailureHandler(new MemberAuthenticationFailureHandler());

            JwtVerificationFilter jwtVerificationFilter = new JwtVerificationFilter(jwtTokenizer(), authorityUtils);

            builder
                    .addFilter(jwtAuthenticationFilter)
                    .addFilterAfter(jwtVerificationFilter, JwtAuthenticationFilter.class);
        }
    }
}
