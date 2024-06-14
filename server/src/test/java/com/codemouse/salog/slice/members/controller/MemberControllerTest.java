package com.codemouse.salog.slice.members.controller;

import com.codemouse.salog.auth.config.SecurityConfiguration;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.members.controller.MemberController;
import com.codemouse.salog.members.dto.EmailRequestDto;
import com.codemouse.salog.members.dto.MemberDto;
import com.codemouse.salog.members.service.MemberService;
import com.google.gson.Gson;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;


import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = MemberController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("회원 컨트롤러 슬라이스 테스트")
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
    private SecurityConfiguration securityConfiguration;

    @Test
    @DisplayName("/signup")
    @Order(1)
    void postMemberTest() throws Exception {
        // given
        MemberDto.Post post = new MemberDto.Post("test@gmail.com", "1234qwer!@#$", false, false);

        String content = gson.toJson(post);

        // when
        mockMvc.perform(
                post("/members/signup")
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
                )

                // Then
                .andExpect(status().isCreated())
                .andDo(print());
        verify(memberService, times(1)).createMember(any(MemberDto.Post.class));
    }

    @Test
    @DisplayName("/update")
    @Order(2)
    void updateMemberTest() throws Exception {
        // given
        MemberDto.Patch patch = new MemberDto.Patch(true, true);

        String content = gson.toJson(patch);

        // when
        mockMvc.perform(
                patch("/members/update")
                        .header("Authorization", "Bearer fakeToken")
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
                )

                // then
                .andExpect(status().isOk())
                .andDo(print());
    }

    @Test
    @DisplayName("/changePassword")
    @Order(3)
    void changePasswordTest() throws Exception {
        // given
        MemberDto.PatchPassword dto = new MemberDto.PatchPassword("123!@#asdasd123","123456!@#asd123");
        String content = gson.toJson(dto);

        // when
        mockMvc.perform(
                patch("/members/changePassword")
                        .header("Authorization", "Bearer fakeToken")
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
                )

                // then
                .andExpect(status().isOk())
                .andDo(print());
    }

    @Test
    @DisplayName("/findPassword")
    @Order(4)
    void findPasswordTest() throws Exception {
        // given
        EmailRequestDto dto = new EmailRequestDto("test@mail.com", "123qwe!@#qwe");
        String content = gson.toJson(dto);

        // when
        mockMvc.perform(
                post("/members/findPassword")
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
                )

                // then
                .andExpect(status().isOk())
                .andDo(print());
    }

    @Test
    @DisplayName("/get")
    @Order(5)
    void getMemberTest() throws Exception {
        // when
        mockMvc.perform(
                get("/members/get")
                        .header("Authorization", "Bearer fakeToken")
                        .accept(MediaType.APPLICATION_JSON)
                )

                // then
                .andExpect(status().isOk())
                .andDo(print());
    }

    @Test
    @DisplayName("/leaveid")
    @Order(6)
    void deleteMemberTest() throws Exception {
        // when
        mockMvc.perform(
                delete("/members/leaveid")
                        .header("Authorization", "Bearer fakeToken")
                        .accept(MediaType.APPLICATION_JSON)
                )

                // then
                .andExpect(status().isNoContent())
                .andDo(print());
    }

    @Test
    @DisplayName("/emailcheck")
    @Order(7)
    void emailCheckMemberTest() throws Exception {
        // given
        EmailRequestDto dto = new EmailRequestDto("test@email.com", "123!@#qwe123");
        String content = gson.toJson(dto);

        // when
        mockMvc.perform(
                post("/members/emailcheck")
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
        )

                // then
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("/signup/sendmail")
    @Order(8)
    void sendVerificationEmailTest() throws Exception {
        // given
        EmailRequestDto dto = new EmailRequestDto("test@email.com", "123!@#123qwe");
        String content = gson.toJson(dto);

        // when
        mockMvc.perform(
                post("/members/signup/sendmail")
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
        )

                // then
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("/findPassword/sendmail")
    @Order(9)
    void findPasswordSendVerificationEmailTest() throws Exception {
        // given
        EmailRequestDto dto = new EmailRequestDto("test@email.com", "123!@#123qwe");
        String content = gson.toJson(dto);

        // when
        mockMvc.perform(
                post("/members/findPassword/sendmail")
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
        )

                // then
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("/logout")
    @Order(10)
    void logoutTest() throws Exception {
        // when
        mockMvc.perform(
                post("/members/logout")
                        .header("Authorization", "Bearer fakeToken")
                        .accept(MediaType.APPLICATION_JSON)
        )

                // then
                .andExpect(status().isOk());
    }
}