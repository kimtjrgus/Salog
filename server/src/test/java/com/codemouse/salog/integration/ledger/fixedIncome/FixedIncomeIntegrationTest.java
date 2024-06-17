package com.codemouse.salog.integration.ledger.fixedIncome;

import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.ledger.fixedIncome.dto.FixedIncomeDto;
import com.codemouse.salog.ledger.fixedIncome.entity.FixedIncome;
import com.codemouse.salog.ledger.fixedIncome.repository.FixedIncomeRepository;
import com.codemouse.salog.ledger.fixedIncome.service.FixedIncomeService;
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
public class FixedIncomeIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @SpyBean
    private FixedIncomeService fixedIncomeService;
    @SpyBean
    private FixedIncomeRepository fixedIncomeRepository;
    @SpyBean
    private MemberRepository memberRepository;
    @SpyBean
    private TokenBlackListService tokenBlackListService;

    @Autowired
    Gson gson = new Gson();
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JdbcTemplate jdbcTemplate;


    private String token;
    private Member member;
    private FixedIncome fixedIncome;

    @BeforeEach
    void setup() throws Exception {
        jdbcTemplate.execute("ALTER TABLE member ALTER COLUMN member_id RESTART WITH 1");
        jdbcTemplate.execute("ALTER TABLE fixed_income ALTER COLUMN fixed_income_id RESTART WITH 1");

        memberRepository.deleteAll();
        fixedIncomeRepository.deleteAll();

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

        fixedIncome = new FixedIncome();
        fixedIncome.setFixedIncomeId(1L);
        fixedIncome.setIncomeName("testName");
        fixedIncome.setMoney(10000);
        fixedIncome.setDate(LocalDate.of(2024,1,1));
        fixedIncome.setMember(member);

        fixedIncomeRepository.save(fixedIncome);
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
    @DisplayName("고정 수입 생성 성공")
    @Order(1)
    void postFixedIncome_Success() throws Exception {
        // given
        FixedIncomeDto.Post postDto = new FixedIncomeDto.Post(
                10000, "testName", LocalDate.of(2024,1,1)
        );

        // LocalDate 커스텀 직렬화
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .create();

        String content = gson.toJson(postDto);

        // when
        mockMvc.perform(
                post("/fixedIncome/post")
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
                .andDo(document("FixedIncomeIntegrationTest/postFixedIncome_Success",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("고정 수입명"),
                                fieldWithPath("date").description("수입 날짜")
                        ),
                        responseFields(
                                fieldWithPath("fixedIncomeId").description("수입 식별자"),
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("고정 수입명"),
                                fieldWithPath("date").description("수입 날짜")
                        )
                ));
    }

    @Test
    @DisplayName("고정 수입 수정 성공")
    @Order(2)
    void patchFixedIncome_Success() throws Exception {
        // given
        FixedIncomeDto.Patch patchDto = new FixedIncomeDto.Patch(
                1000, "fixedName", LocalDate.of(2024,1,2)
        );

        // LocalDate 커스텀 직렬화
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .create();

        String content = gson.toJson(patchDto);

        // when
        mockMvc.perform(
                patch("/fixedIncome/update/{fixedIncome-id}", 1L)
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
                .andDo(document("FixedIncomeIntegrationTest/patchFixedIncome_Success",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("고정 수입명"),
                                fieldWithPath("date").description("수입 날짜")
                        ),
                        responseFields(
                                fieldWithPath("fixedIncomeId").description("수입 식별자"),
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("고정 수입명"),
                                fieldWithPath("date").description("수입 날짜")
                        )
                ));
    }

    @Test
    @DisplayName("고정 수입 수정 실패 : 고정 수입이 존재하지 않는 경우")
    @Order(3)
    void patchFixedIncome_Fail() throws Exception {
        // given
        FixedIncomeDto.Patch patchDto = new FixedIncomeDto.Patch(
                1000, "fixedName", LocalDate.of(2024,1,2)
        );

        // LocalDate 커스텀 직렬화
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .create();

        String content = gson.toJson(patchDto);

        // when
        mockMvc.perform(
                        patch("/fixedIncome/update/{fixedIncome-id}", 2L)
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
                .andDo(document("FixedIncomeIntegrationTest/patchFixedIncome_Fail",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("고정 수입명"),
                                fieldWithPath("date").description("수입 날짜")
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
    @DisplayName("고정 수입 조회 성공 1 : 일자가 유효한 경우 (일별 조회)")
    @Order(4)
    void getAllFixedIncomes_Success1() throws Exception {
        // when
        mockMvc.perform(
                get("/fixedIncome/get")
                        .header("Authorization", token)
                        .param("page", "1")
                        .param("size", "5")
                        .param("date", "2024-01-01")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isOk())
                .andDo(print())

                // documentation
                .andDo(document("FixedIncomeIntegrationTest/getAllFixedIncomes_Success1",
                preprocessRequest(prettyPrint()),
                preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
                                parameterWithName("page").description("페이지 번호"),
                                parameterWithName("size").description("페이지 크기"),
                                parameterWithName("date").description("조회 날짜 (유효하지 않음)")
                        ),
                        responseFields(
                                fieldWithPath("data").description("데이터 목록"),
                                fieldWithPath("data[].fixedIncomeId").description("고정 수입 식별자"),
                                fieldWithPath("data[].money").description("고정 수입 금액"),
                                fieldWithPath("data[].incomeName").description("고정 수입명"),
                                fieldWithPath("data[].date").description("고정 수입 날짜"),
                                fieldWithPath("pageInfo").description("페이지 정보"),
                                fieldWithPath("pageInfo.pageNumber").description("현재 페이지 번호"),
                                fieldWithPath("pageInfo.pageSize").description("페이지 크기"),
                                fieldWithPath("pageInfo.totalElements").description("총 요소 수"),
                                fieldWithPath("pageInfo.totalPages").description("전체 페이지 수")
                        )
                ));
    }

    @Test
    @DisplayName("고정 수입 조회 성공 2 : 일자가 0인 경우 (월별 조회)")
    @Order(5)
    void getAllFixedIncomes_Success2() throws Exception {
        // when
        mockMvc.perform(
                        get("/fixedIncome/get")
                                .header("Authorization", token)
                                .param("page", "1")
                                .param("size", "5")
                                .param("date", "2024-01-00")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isOk())
                .andDo(print())

                // documentation
                .andDo(document("FixedIncomeIntegrationTest/getAllFixedIncomes_Success2",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
                                parameterWithName("page").description("페이지 번호"),
                                parameterWithName("size").description("페이지 크기"),
                                parameterWithName("date").description("조회 날짜 (유효하지 않음)")
                        ),
                        responseFields(
                                fieldWithPath("data").description("데이터 목록"),
                                fieldWithPath("data[].fixedIncomeId").description("고정 수입 식별자"),
                                fieldWithPath("data[].money").description("고정 수입 금액"),
                                fieldWithPath("data[].incomeName").description("고정 수입명"),
                                fieldWithPath("data[].date").description("고정 수입 날짜"),
                                fieldWithPath("pageInfo").description("페이지 정보"),
                                fieldWithPath("pageInfo.pageNumber").description("현재 페이지 번호"),
                                fieldWithPath("pageInfo.pageSize").description("페이지 크기"),
                                fieldWithPath("pageInfo.totalElements").description("총 요소 수"),
                                fieldWithPath("pageInfo.totalPages").description("전체 페이지 수")
                        )
                ));
    }

    @Test
    @DisplayName("고정 수입 조회 실패 1 : 일자가 유효하지 않은 경우")
    @Order(6)
    void getAllFixedIncomes_Fail1() throws Exception {
        // when
        mockMvc.perform(
                        get("/fixedIncome/get")
                                .header("Authorization", token)
                                .param("page", "1")
                                .param("size", "5")
                                .param("date", "2024-01-123")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isBadRequest())
                .andDo(print())

                // documentation
                .andDo(document("FixedIncomeIntegrationTest/getAllFixedIncomes_Fail1",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
                                parameterWithName("page").description("페이지 번호"),
                                parameterWithName("size").description("페이지 크기"),
                                parameterWithName("date").description("조회 날짜 (유효하지 않음)")
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
    @DisplayName("고정 수입 조회 실패 2 : 월자가 유효하지 않은 경우")
    @Order(7)
    void getAllFixedIncomes_Fail2() throws Exception {
        // when
        mockMvc.perform(
                        get("/fixedIncome/get")
                                .header("Authorization", token)
                                .param("page", "1")
                                .param("size", "5")
                                .param("date", "2024-123-00")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isBadRequest())
                .andDo(print())

                // documentation
                .andDo(document("FixedIncomeIntegrationTest/getAllFixedIncomes_Fail2",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
                                parameterWithName("page").description("페이지 번호"),
                                parameterWithName("size").description("페이지 크기"),
                                parameterWithName("date").description("조회 날짜 (유효하지 않음)")
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
    @DisplayName("고정 수입 삭제 성공")
    @Order(8)
    void deleteFixedIncome_Success() throws Exception {
        // when
        mockMvc.perform(
                        delete("/fixedIncome/delete/{fixedIncome-id}", 1L)
                                .header("Authorization", token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isNoContent())
                .andDo(print())

                // documentation
                .andDo(document("FixedIncomeIntegrationTest/deleteFixedIncome_Success",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        )
                ));
    }

    @Test
    @DisplayName("고정 수입 삭제 실패 : 고정 수입이 존재하지 않는 경우")
    @Order(9)
    void deleteFixedIncome_Fail() throws Exception {
        // when
        mockMvc.perform(
                        delete("/fixedIncome/delete/{fixedIncome-id}", 2L)
                                .header("Authorization", token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isNotFound())
                .andDo(print())

                // documentation
                .andDo(document("FixedIncomeIntegrationTest/deleteFixedIncome_Fail",
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
