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
                        .antMatchers(HttpMethod.POST, "/members/signup/sendmail").permitAll()
                        .antMatchers(HttpMethod.POST, "/members/login").permitAll()
                        .antMatchers(HttpMethod.POST, "members/logout").hasRole("USER")
                        .antMatchers(HttpMethod.POST, "/members/emailcheck").permitAll()
                        .antMatchers(HttpMethod.POST, "/members/findPassword").permitAll()
                        .antMatchers(HttpMethod.POST, "/members/findPassword/sendmail").permitAll()
                        .antMatchers(HttpMethod.GET, "/members/get").hasRole("USER")
                        .antMatchers(HttpMethod.DELETE, "/members/leaveid").hasRole("USER")
                        .antMatchers(HttpMethod.PATCH, "/members/update").hasRole("USER")
                        .antMatchers(HttpMethod.PATCH, "/members/changePassword").hasRole("USER")

                        // 수입
                        .antMatchers(HttpMethod.POST, "/income/post").hasRole("USER")
                        .antMatchers(HttpMethod.PATCH, "/income/update").hasRole("USER")
                        .antMatchers(HttpMethod.GET, "/income/**").hasRole("USER")
                        .antMatchers(HttpMethod.DELETE, "/income/delete").hasRole("USER")

                        // 지출
                        .antMatchers(HttpMethod.POST, "/outgo/post").hasRole("USER")
                        .antMatchers(HttpMethod.PATCH, "/outgo/update").hasRole("USER")
                        .antMatchers(HttpMethod.GET, "/outgo/**").hasRole("USER")
                        .antMatchers(HttpMethod.DELETE, "/outgo/delete").hasRole("USER")

                        // 고정 수입
                        .antMatchers(HttpMethod.POST, "/fixedIncome/post").hasRole("USER")
                        .antMatchers(HttpMethod.PATCH, "/fixedIncome/update").hasRole("USER")
                        .antMatchers(HttpMethod.GET, "/fixedIncome/get").hasRole("USER")
                        .antMatchers(HttpMethod.DELETE, "/fixedIncome/delete").hasRole("USER")

                        // 고정 지출
                        .antMatchers(HttpMethod.POST, "/fixedOutgo/post").hasRole("USER")
                        .antMatchers(HttpMethod.PATCH, "/fixedOutgo/update").hasRole("USER")
                        .antMatchers(HttpMethod.GET, "/fixedOutgo/get").hasRole("USER")
                        .antMatchers(HttpMethod.DELETE, "/fixedOutgo/delete").hasRole("USER")

                        // 예산
                        .antMatchers(HttpMethod.POST, "/monthlyBudget/post").hasRole("USER")
                        .antMatchers(HttpMethod.PATCH, "/monthlyBudget/update").hasRole("USER")
                        .antMatchers(HttpMethod.GET, "/monthlyBudget").hasRole("USER")
                        .antMatchers(HttpMethod.DELETE, "/monthlyBudget/delete").hasRole("USER")

                        // 일기
                        .antMatchers(HttpMethod.POST, "/diary/post").hasRole("USER")
                        .antMatchers(HttpMethod.PATCH, "/diary/update").hasRole("USER")
                        .antMatchers(HttpMethod.GET, "/diary").hasRole("USER")
                        .antMatchers(HttpMethod.DELETE, "/diary/delete").hasRole("USER")
                        .antMatchers(HttpMethod.GET, "/diary/search").hasRole("USER")

                        // 캘린더
                        .antMatchers(HttpMethod.GET, "/calendar").hasRole("USER")

                        // 태그
                        .antMatchers(HttpMethod.GET, "/ledgerTags").hasRole("USER")
                        .antMatchers(HttpMethod.GET, "/diaryTags").hasRole("USER")

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
