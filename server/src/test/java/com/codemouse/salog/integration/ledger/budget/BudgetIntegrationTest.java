package com.codemouse.salog.integration.ledger.budget;

import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.ledger.budget.dto.BudgetDto;
import com.codemouse.salog.ledger.budget.entity.MonthlyBudget;
import com.codemouse.salog.ledger.budget.repository.BudgetRepository;
import com.codemouse.salog.ledger.budget.service.BudgetService;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.repository.MemberRepository;
import com.google.gson.*;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.restdocs.RestDocumentationExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Type;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

import static org.springframework.restdocs.headers.HeaderDocumentation.headerWithName;
import static org.springframework.restdocs.headers.HeaderDocumentation.requestHeaders;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.prettyPrint;
import static org.springframework.restdocs.payload.PayloadDocumentation.*;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.requestParameters;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest // 테스트 환경 애플리케이션 컨텍스트 로드
@AutoConfigureMockMvc // MockMvc 자동 구성, 웹 계층 테스트
@AutoConfigureRestDocs(outputDir = "build/generated-snippets") // Rest Docs 자동 구성, 문서화
@ExtendWith({RestDocumentationExtension.class, SpringExtension.class}) // JUnit5, Rest Docs 통합 지원
@TestMethodOrder(MethodOrderer.OrderAnnotation.class) // 테스트 케이스 순서 보장
@Transactional
public class BudgetIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @SpyBean
    private BudgetService budgetService;
    @SpyBean
    private TokenBlackListService tokenBlackListService;
    @SpyBean
    private BudgetRepository budgetRepository;
    @SpyBean
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    Gson gson = new Gson();
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String token;
    private Member member;
    private MonthlyBudget budget;

    @BeforeEach
    void setup() throws Exception {
        jdbcTemplate.execute("ALTER TABLE member ALTER COLUMN member_id RESTART WITH 1");
        jdbcTemplate.execute("ALTER TABLE monthly_budget ALTER COLUMN budget_id RESTART WITH 1");

        memberRepository.deleteAll();

        member = new Member();
        member.setMemberId(1L);
        member.setEmail("test@example.com");
        member.setPassword(passwordEncoder.encode("1234qwer!@#$"));
        member.setEmailAlarm(false);
        member.setHomeAlarm(false);
        member.setRoles(List.of("USER"));
        member.setLedgerTags(Collections.emptyList());

        memberRepository.save(member);

        // JWT 토큰 생성
        token = generateAccessToken(member.getEmail());

        budget = new MonthlyBudget();
        budget.setBudgetId(1L);
        budget.setBudget(10000);
        budget.setDate(LocalDate.of(2024,1,1));
        budget.setMember(member);
        budgetRepository.save(budget);
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

    // gson 커스텀 직렬화
    private static class LocalDateSerializer implements JsonSerializer<LocalDate> {
        @Override
        public JsonElement serialize(LocalDate src, Type typeOfSrc, JsonSerializationContext context) {
            return new JsonPrimitive(src.format(DateTimeFormatter.ISO_LOCAL_DATE));
        }
    }

    @Test
    @DisplayName("예산 생성 성공")
    @Order(1)
    void postBudgetTest_Success() throws Exception {
        // given
        BudgetDto.Post postDto = new BudgetDto.Post(
                LocalDate.of(2024,2,1), 10000
        );

        // LocalDate 커스텀 직렬화
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .create();

        String content = gson.toJson(postDto);
        // when
        mockMvc.perform(
                post("/monthlyBudget/post")
                        .header("Authorization", token)
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
        )

                // then
                .andExpect(status().isCreated())
                .andDo(print())

                // documentation
                .andDo(document("BudgetIntegrationTest/postBudgetTest_Success",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("date").description("예산 설정 날짜"),
                                fieldWithPath("budget").description("예산 설정 금액")
                        )
                ));
    }

    @Test
    @DisplayName("예산 생성 실패 : 이미 예산이 존재하는 달")
    @Order(2)
    void postBudgetTest_Fail() throws Exception {
        // given
        BudgetDto.Post postDto = new BudgetDto.Post(
                LocalDate.of(2024,1,1), 10000
        );

        // LocalDate 커스텀 직렬화
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .create();

        String content = gson.toJson(postDto);
        // when
        mockMvc.perform(
                        post("/monthlyBudget/post")
                                .header("Authorization", token)
                                .accept(MediaType.APPLICATION_JSON)
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                                .content(content)
                )

                // then
                .andExpect(status().isBadRequest())
                .andDo(print())

                // documentation
                .andDo(document("BudgetIntegrationTest/postBudgetTest_Fail",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("date").description("예산 설정 날짜"),
                                fieldWithPath("budget").description("예산 설정 금액")
                        ),
                        responseFields(
                                fieldWithPath("status").description("상태 코드"),
                                fieldWithPath("message").description("상태 메시지"),
                                fieldWithPath("fieldErrors").description("입력 필드 에러 목록"),
                                fieldWithPath("violationErrors").description("규칙 위반 목록")
                        )
                ));
    }

    @Test
    @DisplayName("예산 수정 성공")
    @Order(3)
    void updateBudgetTest_Success() throws Exception {
        // given
        BudgetDto.Patch patchDto = new BudgetDto.Patch(
                LocalDate.of(2024,1,1), 1000
        );

        // LocalDate 커스텀 직렬화
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .create();

        String content = gson.toJson(patchDto);
        // when
        mockMvc.perform(
                        patch("/monthlyBudget/update/{budget-id}", 1L)
                                .header("Authorization", token)
                                .accept(MediaType.APPLICATION_JSON)
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                                .content(content)
                )

                // then
                .andExpect(status().isOk())
                .andDo(print())

                // documentation
                .andDo(document("BudgetIntegrationTest/updateBudgetTest_Success",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("date").description("예산 설정 날짜"),
                                fieldWithPath("budget").description("예산 설정 금액")
                        )
                ));
    }

    @Test
    @DisplayName("예산 수정 실패 : 수정할 예산이 없는 경우")
    @Order(4)
    void updateBudgetTest_Fail() throws Exception {
        // given
        BudgetDto.Patch patchDto = new BudgetDto.Patch(
                LocalDate.of(2024,1,1), 1000
        );

        // LocalDate 커스텀 직렬화
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .create();

        String content = gson.toJson(patchDto);
        // when
        mockMvc.perform(
                        patch("/monthlyBudget/update/{budget-id}", 2L)
                                .header("Authorization", token)
                                .accept(MediaType.APPLICATION_JSON)
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                                .content(content)
                )

                // then
                .andExpect(status().isNotFound())
                .andDo(print())

                // documentation
                .andDo(document("BudgetIntegrationTest/updateBudgetTest_Fail",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("date").description("예산 설정 날짜"),
                                fieldWithPath("budget").description("예산 설정 금액")
                        ),
                        responseFields(
                                fieldWithPath("status").description("상태 코드"),
                                fieldWithPath("message").description("상태 메시지"),
                                fieldWithPath("fieldErrors").description("입력 필드 에러 목록"),
                                fieldWithPath("violationErrors").description("규칙 위반 목록")
                        )
                ));
    }

    @Test
    @DisplayName("예산 조회 성공 1")
    @Order(5)
    void getMonthlyBudgetTest_Success1() throws Exception {
        // when
        mockMvc.perform(
                        get("/monthlyBudget")
                                .header("Authorization", token)
                                .param("date", "2024-01")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isOk())
                .andDo(print())

                // documentation
                .andDo(document("BudgetIntegrationTest/getMonthlyBudgetTest_Success1",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
                                parameterWithName("date").description("조회 날짜 (YYYY-MM)")
                        ),
                        responseFields(
                                fieldWithPath("budgetId").description("예산 식별자"),
                                fieldWithPath("date").description("예산 설정 날짜"),
                                fieldWithPath("budget").description("예산 설정 금액"),
                                fieldWithPath("totalOutgo").description("해당 월 지출 합계 (지출이 없는 경우 0 리턴)"),
                                fieldWithPath("dayRemain").description("해당 월 남은 일자 (해당 월 총 일자 - 현재 일자)")
                        )
                ));
    }

    @Test
    @DisplayName("예산 조회 성공 2 : 예산이 없는 경우 (빈 바디)")
    @Order(6)
    void getMonthlyBudgetTest_Success2() throws Exception {
        // when
        mockMvc.perform(
                        get("/monthlyBudget")
                                .header("Authorization", token)
                                .param("date", "2024-02")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isOk())
                .andDo(print())

                // documentation
                .andDo(document("BudgetIntegrationTest/getMonthlyBudgetTest_Success2",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
                                parameterWithName("date").description("조회 날짜 (YYYY-MM)")
                        )
                ));
    }

    @Test
    @DisplayName("예산 삭제 성공")
    @Order(7)
    void deleteBudgetTest_Success() throws Exception {
        // when
        mockMvc.perform(
                        delete("/monthlyBudget/delete/{budget-id}", 1L)
                                .header("Authorization", token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isNoContent())
                .andDo(print())

                // documentation
                .andDo(document("BudgetIntegrationTest/deleteBudgetTest_Success",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        )
                ));
    }

    @Test
    @DisplayName("예산 삭제 실패 : 예산이 존재하지 않는 경우")
    @Order(8)
    void deleteBudgetTest_Fail() throws Exception {
        // when
        mockMvc.perform(
                        delete("/monthlyBudget/delete/{budget-id}", 2L)
                                .header("Authorization", token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isNotFound())
                .andDo(print())

                // documentation
                .andDo(document("BudgetIntegrationTest/deleteBudgetTest_Fail",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        responseFields(
                                fieldWithPath("status").description("상태 코드"),
                                fieldWithPath("message").description("상태 메시지"),
                                fieldWithPath("fieldErrors").description("입력 필드 에러 목록"),
                                fieldWithPath("violationErrors").description("규칙 위반 목록")
                        )
                ));
    }
}
