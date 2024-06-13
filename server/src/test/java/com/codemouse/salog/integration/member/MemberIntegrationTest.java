package com.codemouse.salog.integration.member;

import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.members.dto.EmailRequestDto;
import com.codemouse.salog.members.dto.MemberDto;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.repository.MemberRepository;
import com.codemouse.salog.members.service.MemberService;
import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import com.google.gson.Gson;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.restdocs.RestDocumentationContextProvider;
import org.springframework.restdocs.RestDocumentationExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.restdocs.headers.HeaderDocumentation.*;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.documentationConfiguration;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;
import static org.springframework.restdocs.payload.PayloadDocumentation.*;
import static org.springframework.restdocs.request.RequestDocumentation.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

@SpringBootTest // 테스트 환경 애플리케이션 컨텍스트 로드
@AutoConfigureMockMvc // MockMvc 자동 구성, 웹 계층 테스트
@AutoConfigureRestDocs // Rest Docs 자동 구성, 문서화
@ExtendWith({RestDocumentationExtension.class, SpringExtension.class}) // JUnit5, Rest Docs 통합 지원
@TestMethodOrder(MethodOrderer.OrderAnnotation.class) // 테스트 케이스 순서 보장
@Transactional
public class MemberIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @SpyBean // 실제 객체의 메서드를 호출하면서도 메서드 호출을 검증
    private MemberService memberService;
    @SpyBean
    private TokenBlackListService tokenBlackListService;
    @SpyBean
    private MemberRepository memberRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    Gson gson = new Gson();

    private String token;
    private Member member;

    // given : 회원 모킹
    @BeforeEach
    void setup() throws Exception {
        memberRepository.deleteAll();

        member = new Member();
        member.setMemberId(1L);
        member.setEmail("test@example.com");
        member.setPassword(passwordEncoder.encode("1234qwer!@#$"));
        member.setEmailAlarm(false);
        member.setHomeAlarm(false);
        member.setRoles(List.of("USER"));
        memberRepository.save(member);

        // JWT 토큰 생성
        token = generateAccessToken(member.getEmail());
    }

    // 실제 동작을 모의하기 위한 login 요청 (액세스토큰 추출)
    private String generateAccessToken(String username) throws Exception {
        MvcResult result = mockMvc.perform(post("/members/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + username + "\", \"password\":\"" + "1234qwer!@#$" + "\"}"))
                .andExpect(status().isOk())
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        return JsonPath.read(responseContent, "$.accessToken");
    }

    @Test
    @DisplayName("회원가입")
    @Order(1)
    void postMemberTest() throws Exception {
        // given
        MemberDto.Post postDto = new MemberDto.Post(
                "test@gmail.com", "1234qwer!@#$", false, false
        );

        String content = gson.toJson(postDto);

        // when
        mockMvc.perform(
                post("/members/signup")
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
                )

                // then
                .andExpect(status().isCreated())

                // documentation
                .andDo(document("MemberIntegrationTest/postMemberTest",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestFields(
                                fieldWithPath("email").description("가입 이메일"),
                                fieldWithPath("password").description("비밀번호"),
                                fieldWithPath("homeAlarm").description("웹 페이지 고정 지출 알람"),
                                fieldWithPath("emailAlarm").description("이메일 고정 지출 알람")
                        )
                ));

        // verify
        // postDto 객체를 JSON으로 변환하고 다시 역직렬화하는 과정에서
        // 동일한 객체가 아니게 되므로
        // 필드 값을 검증하기 위해 ArgumentCaptor를 사용하여 실제로 전달된 객체의 필드를 비교
        ArgumentCaptor<MemberDto.Post> captor = forClass(MemberDto.Post.class);
        verify(memberService, times(1)).createMember(captor.capture());
        verify(memberRepository, times(1)).save(member);

        // Assertions
        MemberDto.Post capturedArgument = captor.getValue();
        assertEquals("test@gmail.com", capturedArgument.getEmail());
        assertEquals("1234qwer!@#$", capturedArgument.getPassword());
        assertFalse(capturedArgument.isHomeAlarm());
        assertFalse(capturedArgument.isEmailAlarm());
    }

    @Test
    @DisplayName("회원수정")
    @Order(2)
    void updateMemberTest() throws Exception {
        // given
        MemberDto.Patch patchDto = new MemberDto.Patch(
                true, true
        );

        String content = gson.toJson(patchDto);

        // when
        mockMvc.perform(
                patch("/members/update")
                        .header("Authorization", token)
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
        )

                // then
                .andExpect(status().isOk())

                // documentation
                .andDo(document("MemberIntegrationTest/updateMemberTest",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("homeAlarm").description("웹 페이지 고정 지출 알람"),
                                fieldWithPath("emailAlarm").description("이메일 고정 지출 알람")
                        )
                ));

        // verify
        verify(tokenBlackListService, times(1)).isBlackListed(token);

        ArgumentCaptor<MemberDto.Patch> captor = forClass(MemberDto.Patch.class);
        verify(memberService, times(1)).updateMember(eq(token), captor.capture());
        verify(memberRepository, times(1)).save(member);

        // Assertions
        MemberDto.Patch capturedArgument = captor.getValue();
        assertTrue(capturedArgument.isHomeAlarm());
        assertTrue(capturedArgument.isEmailAlarm());
    }

    @Test
    @DisplayName("비밀번호 변경")
    @Order(3)
    void changePasswordTest() throws Exception {
        // given
        MemberDto.PatchPassword patchPasswordDto = new MemberDto.PatchPassword(
                "1234qwer!@#$","123456!@#asd123"
        );

        String content = gson.toJson(patchPasswordDto);

        // when
        mockMvc.perform(
                patch("/members/changePassword")
                        .header("Authorization", token)
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
        )

                // then
                .andExpect(status().isOk())

                // documentation
                .andDo(document("MemberIntegrationTest/changePasswordTest",
                preprocessRequest(prettyPrint()),
                preprocessResponse(prettyPrint()),
                requestHeaders(
                        headerWithName("Authorization").description("JWT 액세스 토큰")
                ),
                requestFields(
                        fieldWithPath("curPassword").description("이전 비밀번호"),
                        fieldWithPath("newPassword").description("변경할 비밀번호")
                )
        ));

        // verify
        verify(tokenBlackListService, times(1)).isBlackListed(token);

        ArgumentCaptor<MemberDto.PatchPassword> captor = forClass(MemberDto.PatchPassword.class);
        verify(memberService, times(1)).updatePassword(eq(token), captor.capture());
        verify(memberRepository, times(1)).save(member);

        // Assertions
        MemberDto.PatchPassword capturedArgument = captor.getValue();
        assertEquals("1234qwer!@#$", capturedArgument.getCurPassword());
        assertEquals("123456!@#asd123", capturedArgument.getNewPassword());
    }

    @Test
    @DisplayName("비밀번호 찾기")
    @Order(4)
    void findPasswordTest() throws Exception {
        // given
        EmailRequestDto emailRequestDto = new EmailRequestDto(
                member.getEmail(), "123456!@#asd123"
        );

        String content = gson.toJson(emailRequestDto);

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

                // documentation
                .andDo(document("MemberIntegrationTest/findPasswordTest",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestFields(
                                fieldWithPath("email").description("가입된 회원 이메일"),
                                fieldWithPath("newPassword").description("변경할 비밀번호")
                        )
                ));

        // verify
        ArgumentCaptor<String> emailCaptor = forClass(String.class);
        ArgumentCaptor<String> passwordCaptor = forClass(String.class);
        verify(memberService, times(1)).findPassword(emailCaptor.capture(), passwordCaptor.capture());
        verify(memberRepository, times(1)).save(member);

        // Assertions
        assertEquals(member.getEmail(), emailCaptor.getValue());
        assertEquals("123456!@#asd123", passwordCaptor.getValue());
    }

    @Test
    @DisplayName("회원조회")
    @Order(5)
    void getMemberTest() throws Exception {
        // given
        MemberDto.Response response = new MemberDto.Response();
        response.setMemberId(member.getMemberId());
        response.setEmail(member.getEmail());
        response.setEmailAlarm(member.isEmailAlarm());
        response.setHomeAlarm(member.isHomeAlarm());
        response.setCreatedAt(member.getCreatedAt());
        response.setIncomeTags(List.of(new LedgerTagDto.Response(1L, "incomeTag")));
        response.setOutgoTags(List.of(new LedgerTagDto.Response(1L, "outgoTag")));

        // when
        mockMvc.perform(
                        get("/members/get")
                                .header("Authorization", token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .accept(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.memberId").value(member.getMemberId()))
                .andExpect(jsonPath("$.email").value(member.getEmail()))
                .andExpect(jsonPath("$.emailAlarm").value(member.isEmailAlarm()))
                .andExpect(jsonPath("$.homeAlarm").value(member.isHomeAlarm()))
                .andExpect(jsonPath("$.incomeTags", hasSize(1)))
                .andExpect(jsonPath("$.outgoTags", hasSize(1)))

                // documentation
                .andDo(document("MemberIntegrationTest/getMemberTest",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        responseFields(
                                fieldWithPath("memberId").description("회원 ID"),
                                fieldWithPath("email").description("회원 이메일"),
                                fieldWithPath("emailAlarm").description("이메일 알림 설정"),
                                fieldWithPath("homeAlarm").description("홈 알림 설정"),
                                fieldWithPath("createdAt").description("계정 생성 일시"),
                                fieldWithPath("incomeTags").description("수입 태그 목록"),
                                fieldWithPath("incomeTags[].id").description("태그 ID"),
                                fieldWithPath("incomeTags[].name").description("태그 이름"),
                                fieldWithPath("outgoTags").description("지출 태그 목록"),
                                fieldWithPath("outgoTags[].id").description("태그 ID"),
                                fieldWithPath("outgoTags[].name").description("태그 이름")
                        )
                ));

        // verify
        verify(tokenBlackListService, times(1)).isBlackListed(token);
        verify(memberService, times(1)).findMember(token);
    }
}
