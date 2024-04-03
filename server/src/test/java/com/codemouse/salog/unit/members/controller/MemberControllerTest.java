package com.codemouse.salog.unit.members.controller;

import com.codemouse.salog.auth.config.SecurityConfiguration;
import com.codemouse.salog.auth.utils.CustomAuthorityUtils;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.members.controller.MemberController;
import com.codemouse.salog.members.dto.MemberDto;
import com.codemouse.salog.members.service.MemberService;
import com.google.gson.Gson;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;


import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = MemberController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("회원 유닛 테스트")
public class MemberControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    Gson gson = new Gson();
    @MockBean
    private MemberService memberService;
    @MockBean
    private TokenBlackListService tokenBlackListService;
    @MockBean
    private CustomAuthorityUtils customAuthorityUtils;
    @MockBean
    private SecurityConfiguration securityConfiguration;

    @Test
    @DisplayName("회원가입 테스트")
    void postMemberTest() throws Exception {
        // given
        MemberDto.Post post = new MemberDto.Post("test@gmail.com", "1234qwer!@#$", false, false);

        String content = gson.toJson(post);

        // When
        mockMvc.perform(post("/members/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(content))
                .andExpect(status().isCreated())
                .andDo(print());

        // Then
        verify(memberService, times(1)).createMember(any(MemberDto.Post.class));
    }

    @Test
    @DisplayName("회원수정 테스트")
    void updateMemberTest() throws Exception {
        // given
        MemberDto.Patch patch = new MemberDto.Patch(true, true);

        // 가짜 사용자 생성
        UsernamePasswordAuthenticationToken principal = new UsernamePasswordAuthenticationToken(
                "username", "password", AuthorityUtils.createAuthorityList("ROLE_USER"));

        // SecurityContextHolder에 가짜 사용자 설정
        SecurityContextHolder.getContext().setAuthentication(principal);

        String content = gson.toJson(patch);

        // when
        ResultActions actions =
                mockMvc.perform(
                        patch("/members/update")
                                .header("Authorization", "Bearer fakeToken")
                                .accept(MediaType.APPLICATION_JSON)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(content)
                );

        // then
        actions.andExpect(status().isOk()).andDo(print());
    }

    @Test
    @DisplayName("회원조회 테스트")
    void getMemberTest() throws Exception {
        // given
        // 가짜 사용자 생성
        UsernamePasswordAuthenticationToken principal = new UsernamePasswordAuthenticationToken(
                "username", "password", AuthorityUtils.createAuthorityList("ROLE_USER"));

        // SecurityContextHolder에 가짜 사용자 설정
        SecurityContextHolder.getContext().setAuthentication(principal);

        // when
        ResultActions actions =
                mockMvc.perform(
                        get("/members/get")
                                .header("Authorization", "Bearer fakeToken")
                                .accept(MediaType.APPLICATION_JSON)
                                .contentType(MediaType.APPLICATION_JSON)
                );

        // then
        actions.andExpect(status().isOk()).andDo(print());
    }

    @Test
    @DisplayName("회원탈퇴 테스트")
    void deleteMemberTest() throws Exception {
        // given
        // 가짜 사용자 생성
        UsernamePasswordAuthenticationToken principal = new UsernamePasswordAuthenticationToken(
                "username", "password", AuthorityUtils.createAuthorityList("ROLE_USER"));

        // SecurityContextHolder에 가짜 사용자 설정
        SecurityContextHolder.getContext().setAuthentication(principal);

        // when
        ResultActions actions =
                mockMvc.perform(
                        delete("/members/leaveid")
                                .header("Authorization", "Bearer fakeToken")
                                .accept(MediaType.APPLICATION_JSON)
                                .contentType(MediaType.APPLICATION_JSON)
                );

        // then
        actions.andExpect(status().isNoContent()).andDo(print());
    }
}