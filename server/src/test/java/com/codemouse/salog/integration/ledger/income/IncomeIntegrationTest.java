package com.codemouse.salog.integration.ledger.income;

import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.ledger.income.dto.IncomeDto;
import com.codemouse.salog.ledger.income.entity.Income;
import com.codemouse.salog.ledger.income.repository.IncomeRepository;
import com.codemouse.salog.ledger.income.service.IncomeService;
import com.codemouse.salog.members.entity.Member;
import com.codemouse.salog.members.repository.MemberRepository;
import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import com.codemouse.salog.tags.ledgerTags.repository.LedgerTagRepository;
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
import org.springframework.restdocs.payload.JsonFieldType;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.restdocs.headers.HeaderDocumentation.headerWithName;
import static org.springframework.restdocs.headers.HeaderDocumentation.requestHeaders;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.prettyPrint;
import static org.springframework.restdocs.payload.PayloadDocumentation.*;
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
public class IncomeIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @SpyBean
    private TokenBlackListService tokenBlackListService;
    @SpyBean
    private IncomeService incomeService;
    @SpyBean
    private IncomeRepository incomeRepository;
    @SpyBean
    private MemberRepository memberRepository;
    @SpyBean
    private LedgerTagRepository ledgerTagRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    Gson gson = new Gson();
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String token;
    private Member member;
    private Income income;

    // given : 회원 모킹, 수입 모킹
    @BeforeEach
    void setup() throws Exception {
        /*
        회원과 수입이 각 테스트 실행 시 마다 DB에서 식별자가 증가하는 문제가 있기 때문에
        기존 @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)를 사용해서 컨택스트를 리로딩함
        ex. memberIntegrationTest
        그러나 아래의 jdbc 템플릿 라이브러리를 사용하여 매 테스트 시작 전 sql 문을 삽입하여 문제를 해결함
        이로써 기존에 컨택스트를 리로딩하면서 발생하는 테스트 속도 저하를 해결함

        다만, DB 종속성 문제가 있을 수 있으나, 기본적으로 테스트 db는 H2를 사용하는데, 실 사용 DB가 Mysql이기 때문에
        현재까지는 문제가 없음
         */
        jdbcTemplate.execute("ALTER TABLE member ALTER COLUMN member_id RESTART WITH 1");
        jdbcTemplate.execute("ALTER TABLE income ALTER COLUMN income_id RESTART WITH 1");
        jdbcTemplate.execute("ALTER TABLE ledger_tag ALTER COLUMN ledger_tag_id RESTART WITH 1");

        memberRepository.deleteAll();
        incomeRepository.deleteAll();

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

        incomeRepository.deleteAll();

        income = new Income();
        income.setIncomeId(1L);
        income.setMoney(10000);
        income.setIncomeName("testIncomeName");
        income.setMemo("testIncomeMemo");
        income.setDate(LocalDate.of(2024,1,1));
        income.setMember(member);
        income.setLedgerTag(null);

        incomeRepository.save(income);
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
    @DisplayName("수입 생성 성공 1 : 태그가 null인 경우")
    @Order(1)
    void postIncomeTest_Success1() throws Exception {
        // given
        IncomeDto.Post postDto = new IncomeDto.Post(
                10000, "testName", "testMemo", LocalDate.of(2024, 1, 1), null
        );

        // LocalDate 커스텀 직렬화
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .serializeNulls() // null 값 포함
                .create();

        String content = gson.toJson(postDto);

        // when
        mockMvc.perform(
                        post("/income/post")
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
                .andDo(document("IncomeIntegrationTest/postIncomeTest_Success1",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("date").description("수입 날짜"),
                                fieldWithPath("incomeTag").description("수입 태그 이름")
                        ),
                        responseFields(
                                fieldWithPath("incomeId").description("수입 식별자"),
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("date").description("수입 날짜"),
                                fieldWithPath("incomeTag").description("수입 태그")
                        )
                ));
    }

    @Test
    @DisplayName("수입 생성 성공 2 : 태그가 존재하지 않는 경우")
    @Order(2)
    void postIncomeTest_Success2() throws Exception {
        // given
        IncomeDto.Post postDto = new IncomeDto.Post(
                10000, "testName", "testMemo", LocalDate.of(2024, 1, 1), "testTag"
        );

        // LocalDate 커스텀 직렬화
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .create();

        String content = gson.toJson(postDto);

        // when
        mockMvc.perform(
                post("/income/post")
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
                .andDo(document("IncomeIntegrationTest/postIncomeTest_Success2",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("date").description("수입 날짜"),
                                fieldWithPath("incomeTag").description("수입 태그 이름")
                        ),
                        responseFields(
                                fieldWithPath("incomeId").description("수입 식별자"),
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("date").description("수입 날짜"),
                                fieldWithPath("incomeTag").description("수입 태그"),
                                fieldWithPath("incomeTag.ledgerTagId").description("수입 태그 식별자"),
                                fieldWithPath("incomeTag.tagName").description("수입 태그 이름")
                        )
                        ));
    }

    @Test
    @DisplayName("수입 생성 성공 3 : 태그가 이미 존재하는 경우")
    @Order(3)
    void postIncomeTest_Success3() throws Exception {
        // given
        LedgerTag tag = new LedgerTag();
        tag.setIncomes(List.of(income));
        tag.setLedgerTagId(1L);
        tag.setCategory(LedgerTag.Group.INCOME);
        tag.setMember(member);
        tag.setOutgos(null);
        tag.setTagName("existTag");
        ledgerTagRepository.save(tag);

        IncomeDto.Post postDto = new IncomeDto.Post(
                10000, "testName", "testMemo", LocalDate.of(2024, 1, 1), "existTag"
        );

        // LocalDate 커스텀 직렬화
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .create();

        String content = gson.toJson(postDto);

        // when
        mockMvc.perform(
                        post("/income/post")
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
                .andDo(document("IncomeIntegrationTest/postIncomeTest_Success3",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("date").description("수입 날짜"),
                                fieldWithPath("incomeTag").description("수입 태그 이름")
                        ),
                        responseFields(
                                fieldWithPath("incomeId").description("수입 식별자"),
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("date").description("수입 날짜"),
                                fieldWithPath("incomeTag").description("수입 태그"),
                                fieldWithPath("incomeTag.ledgerTagId").description("수입 태그 식별자"),
                                fieldWithPath("incomeTag.tagName").description("수입 태그 이름")
                        )
                ));
    }

    @Test
    @DisplayName("수입 생성 실패 : 태그가 유효성 검증에 실패하는 경우")
    @Order(4)
    void postIncomeTest_Fail() throws Exception {
        // given
        IncomeDto.Post postDto = new IncomeDto.Post(
                10000, "testName", "testMemo", LocalDate.of(2024, 1, 1),
                "testTagName length must be under 10"
        );

        // LocalDate 커스텀 직렬화
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .create();

        String content = gson.toJson(postDto);

        // when
        mockMvc.perform(
                        post("/income/post")
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
                .andDo(document("IncomeIntegrationTest/postIncomeTest_Fail",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("date").description("수입 날짜"),
                                fieldWithPath("incomeTag").description("수입 태그 이름")
                        ),
                        responseFields(
                                fieldWithPath("status").description("상태 코드"),
                                fieldWithPath("message").description("상태 메시지"),
                                fieldWithPath("fieldErrors").description("입력 필드 에러 목록"),
                                fieldWithPath("fieldErrors[].field").description("잘못된 입력 필드의 이름"),
                                fieldWithPath("fieldErrors[].rejectedValue").description("거부된 입력 값"),
                                fieldWithPath("fieldErrors[].reason").description("거부된 입력 값의 구체적인 이유"),
                                fieldWithPath("violationErrors").description("규칙 위반 목록")
                        )
                ));
    }

    @Test
    @DisplayName("수입 수정 성공 1 : 태그가 null 인 경우")
    @Order(5)
    void updateIncomeTest_Success1() throws Exception {
        // given
        IncomeDto.Patch patchDto = new IncomeDto.Patch(
                100000, "fixedName", "fixedMemo",null
        );

        Gson gson = new GsonBuilder()
                .serializeNulls() // null 값 포함
                .create();

        String content = gson.toJson(patchDto);

        // when
        mockMvc.perform(
                patch("/income/update/{income-id}", income.getIncomeId())
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
                .andDo(document("IncomeIntegrationTest/updateIncomeTest_Success1",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("incomeTag").description("수입 태그 이름")
                        ),
                        responseFields(
                                fieldWithPath("incomeId").description("수입 식별자"),
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("date").description("수입 날짜"),
                                fieldWithPath("incomeTag").description("수입 태그")
                        )
                ));
    }

    @Test
    @DisplayName("수입 수정 성공 2 : 태그가 존재하지 않는 경우")
    @Order(6)
    void updateIncomeTest_Success2() throws Exception {
        // given
        IncomeDto.Patch patchDto = new IncomeDto.Patch(
                100000, "fixedName", "fixedMemo","testTag"
        );

        String content = gson.toJson(patchDto);

        // when
        mockMvc.perform(
                        patch("/income/update/{income-id}", income.getIncomeId())
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
                .andDo(document("IncomeIntegrationTest/updateIncomeTest_Success2",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("incomeTag").description("수입 태그 이름")
                        ),
                        responseFields(
                                fieldWithPath("incomeId").description("수입 식별자"),
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("date").description("수입 날짜"),
                                fieldWithPath("incomeTag").description("수입 태그"),
                                fieldWithPath("incomeTag.ledgerTagId").description("수입 태그 식별자"),
                                fieldWithPath("incomeTag.tagName").description("수입 태그 이름")
                        )
                ));
    }

    @Test
    @DisplayName("수입 수정 성공 3 : 태그가 이미 존재하는 경우")
    @Order(7)
    void updateIncomeTest_Success3() throws Exception {
        // given
        LedgerTag tag = new LedgerTag();
        tag.setIncomes(List.of(income));
        tag.setLedgerTagId(1L);
        tag.setCategory(LedgerTag.Group.INCOME);
        tag.setMember(member);
        tag.setOutgos(null);
        tag.setTagName("existTag");
        ledgerTagRepository.save(tag);

        IncomeDto.Patch patchDto = new IncomeDto.Patch(
                100000, "fixedName", "fixedMemo","existTag"
        );

        String content = gson.toJson(patchDto);

        // when
        mockMvc.perform(
                        patch("/income/update/{income-id}", income.getIncomeId())
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
                .andDo(document("IncomeIntegrationTest/updateIncomeTest_Success3",
                preprocessRequest(prettyPrint()),
                preprocessResponse(prettyPrint()),
                requestHeaders(
                        headerWithName("Authorization").description("JWT 액세스 토큰")
                ),
                requestFields(
                        fieldWithPath("money").description("수입 금액"),
                        fieldWithPath("incomeName").description("수입명"),
                        fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                        fieldWithPath("incomeTag").description("수입 태그 이름")
                ),
                responseFields(
                        fieldWithPath("incomeId").description("수입 식별자"),
                        fieldWithPath("money").description("수입 금액"),
                        fieldWithPath("incomeName").description("수입명"),
                        fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                        fieldWithPath("date").description("수입 날짜"),
                        fieldWithPath("incomeTag").description("수입 태그"),
                        fieldWithPath("incomeTag.ledgerTagId").description("수입 태그 식별자"),
                        fieldWithPath("incomeTag.tagName").description("수입 태그 이름")
                )
        ));
    }

    @Test
    @DisplayName("수입 수정 실패 1 : 태그가 유효성 검증에 실패하는 경우")
    @Order(8)
    void updateIncomeTest_Fail1() throws Exception {
        // given
        IncomeDto.Patch patchDto = new IncomeDto.Patch(
                100000, "fixedName", "fixedMemo","testTagName length must be under 10"
        );

        String content = gson.toJson(patchDto);

        // when
        mockMvc.perform(
                        patch("/income/update/{income-id}", income.getIncomeId())
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
                .andDo(document("IncomeIntegrationTest/updateIncomeTest_Fail1",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("incomeTag").description("수입 태그 이름")
                        ),
                        responseFields(
                                fieldWithPath("status").description("상태 코드"),
                                fieldWithPath("message").description("상태 메시지"),
                                fieldWithPath("fieldErrors").description("입력 필드 에러 목록"),
                                fieldWithPath("fieldErrors[].field").description("잘못된 입력 필드의 이름"),
                                fieldWithPath("fieldErrors[].rejectedValue").description("거부된 입력 값"),
                                fieldWithPath("fieldErrors[].reason").description("거부된 입력 값의 구체적인 이유"),
                                fieldWithPath("violationErrors").description("규칙 위반 목록")
                        )
                ));
    }

    @Test
    @DisplayName("수입 수정 실패 2 : 수입이 존재하지 않는 경우")
    @Order(9)
    void updateIncomeTest_Fail2() throws Exception {
        // given
        IncomeDto.Patch patchDto = new IncomeDto.Patch(
                100000, "fixedName", "fixedMemo", null
        );

        String content = gson.toJson(patchDto);

        // when
        mockMvc.perform(
                        patch("/income/update/{income-id}", 2L)
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
                .andDo(document("IncomeIntegrationTest/updateIncomeTest_Fail2",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestFields(
                                fieldWithPath("money").description("수입 금액"),
                                fieldWithPath("incomeName").description("수입명"),
                                fieldWithPath("memo").description("수입에 대한 간단한 메모")
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
    @DisplayName("수입 조회 성공 1 : 태그가 없고 일자가 유효한 경우 (일별 조회)")
    @Order(10)
    void getAllIncomesTest_Success1() throws Exception {
        // when
        mockMvc.perform(
                        get("/income")
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
                .andDo(document("IncomeIntegrationTest/getAllIncomesTest_Success1",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
                                parameterWithName("page").description("페이지 번호"),
                                parameterWithName("size").description("페이지 크기"),
                                parameterWithName("date").description("조회 날짜")
                        ),
                        responseFields(
                                fieldWithPath("data").description("데이터 목록"),
                                fieldWithPath("data[].incomeId").description("수입 식별자"),
                                fieldWithPath("data[].money").description("수입 금액"),
                                fieldWithPath("data[].incomeName").description("수입명"),
                                fieldWithPath("data[].memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("data[].date").description("수입 날짜"),
                                fieldWithPath("data[].incomeTag").description("수입 태그").optional().type(JsonFieldType.NULL),
                                fieldWithPath("pageInfo").description("페이지 정보"),
                                fieldWithPath("pageInfo.pageNumber").description("현재 페이지 번호"),
                                fieldWithPath("pageInfo.pageSize").description("페이지 크기"),
                                fieldWithPath("pageInfo.totalElements").description("총 요소 수"),
                                fieldWithPath("pageInfo.totalPages").description("전체 페이지 수")
                        )
                ));
    }

    @Test
    @DisplayName("수입 조회 성공 2 : 태그가 없고 일자가 00인 경우 (월별 조회)")
    @Order(11)
    void getAllIncomesTest_Success2() throws Exception {
        // when
        mockMvc.perform(
                        get("/income")
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
                .andDo(document("IncomeIntegrationTest/getAllIncomesTest_Success2",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
                                parameterWithName("page").description("페이지 번호"),
                                parameterWithName("size").description("페이지 크기"),
                                parameterWithName("date").description("조회 날짜")
                        ),
                        responseFields(
                                fieldWithPath("data").description("데이터 목록"),
                                fieldWithPath("data[].incomeId").description("수입 식별자"),
                                fieldWithPath("data[].money").description("수입 금액"),
                                fieldWithPath("data[].incomeName").description("수입명"),
                                fieldWithPath("data[].memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("data[].date").description("수입 날짜"),
                                fieldWithPath("data[].incomeTag").description("수입 태그").optional().type(JsonFieldType.NULL),
                                fieldWithPath("pageInfo").description("페이지 정보"),
                                fieldWithPath("pageInfo.pageNumber").description("현재 페이지 번호"),
                                fieldWithPath("pageInfo.pageSize").description("페이지 크기"),
                                fieldWithPath("pageInfo.totalElements").description("총 요소 수"),
                                fieldWithPath("pageInfo.totalPages").description("전체 페이지 수")
                        )
                ));
    }

    @Test
    @DisplayName("수입 조회 성공 3 : 태그가 있고 일자가 유효한 경우 (일별 조회)")
    @Order(12)
    void getAllIncomesTest_Success3() throws Exception {
        // given
        LedgerTag tag = new LedgerTag();
        tag.setIncomes(List.of(income));
        tag.setLedgerTagId(1L);
        tag.setCategory(LedgerTag.Group.INCOME);
        tag.setMember(member);
        tag.setOutgos(null);
        tag.setTagName("testTag");
        ledgerTagRepository.save(tag);

        income.setLedgerTag(tag);
        incomeRepository.save(income);

        // when
        mockMvc.perform(
                        get("/income")
                                .header("Authorization", token)
                                .param("page", "1")
                                .param("size", "5")
                                .param("incomeTag", "testTag")
                                .param("date", "2024-01-01")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isOk())
                .andDo(print())

                // documentation
                .andDo(document("IncomeIntegrationTest/getAllIncomesTest_Success3",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
                                parameterWithName("page").description("페이지 번호"),
                                parameterWithName("size").description("페이지 크기"),
                                parameterWithName("incomeTag").description("수입 태그 이름"),
                                parameterWithName("date").description("조회 날짜")
                        ),
                        responseFields(
                                fieldWithPath("data").description("데이터 목록"),
                                fieldWithPath("data[].incomeId").description("수입 식별자"),
                                fieldWithPath("data[].money").description("수입 금액"),
                                fieldWithPath("data[].incomeName").description("수입명"),
                                fieldWithPath("data[].memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("data[].date").description("수입 날짜"),
                                fieldWithPath("data[].incomeTag").description("수입 태그"),
                                fieldWithPath("data[].incomeTag.ledgerTagId").description("태그 식별자"),
                                fieldWithPath("data[].incomeTag.tagName").description("태그 이름"),
                                fieldWithPath("pageInfo").description("페이지 정보"),
                                fieldWithPath("pageInfo.pageNumber").description("현재 페이지 번호"),
                                fieldWithPath("pageInfo.pageSize").description("페이지 크기"),
                                fieldWithPath("pageInfo.totalElements").description("총 요소 수"),
                                fieldWithPath("pageInfo.totalPages").description("전체 페이지 수")
                        )
                ));
    }

    @Test
    @DisplayName("수입 조회 성공 4 : 태그가 있고 일자가 00인 경우 (월별 조회)")
    @Order(13)
    void getAllIncomesTest_Success4() throws Exception {
        // given
        LedgerTag tag = new LedgerTag();
        tag.setIncomes(List.of(income));
        tag.setLedgerTagId(1L);
        tag.setCategory(LedgerTag.Group.INCOME);
        tag.setMember(member);
        tag.setOutgos(null);
        tag.setTagName("testTag");
        ledgerTagRepository.save(tag);

        income.setLedgerTag(tag);
        incomeRepository.save(income);

        // when
        mockMvc.perform(
                        get("/income")
                                .header("Authorization", token)
                                .param("page", "1")
                                .param("size", "5")
                                .param("incomeTag", "testTag")
                                .param("date", "2024-01-00")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isOk())
                .andDo(print())

                // documentation
                .andDo(document("IncomeIntegrationTest/getAllIncomesTest_Success4",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
                                parameterWithName("page").description("페이지 번호"),
                                parameterWithName("size").description("페이지 크기"),
                                parameterWithName("incomeTag").description("수입 태그 이름"),
                                parameterWithName("date").description("조회 날짜")
                        ),
                        responseFields(
                                fieldWithPath("data").description("데이터 목록"),
                                fieldWithPath("data[].incomeId").description("수입 식별자"),
                                fieldWithPath("data[].money").description("수입 금액"),
                                fieldWithPath("data[].incomeName").description("수입명"),
                                fieldWithPath("data[].memo").description("수입에 대한 간단한 메모"),
                                fieldWithPath("data[].date").description("수입 날짜"),
                                fieldWithPath("data[].incomeTag").description("수입 태그"),
                                fieldWithPath("data[].incomeTag.ledgerTagId").description("태그 식별자"),
                                fieldWithPath("data[].incomeTag.tagName").description("태그 이름"),
                                fieldWithPath("pageInfo").description("페이지 정보"),
                                fieldWithPath("pageInfo.pageNumber").description("현재 페이지 번호"),
                                fieldWithPath("pageInfo.pageSize").description("페이지 크기"),
                                fieldWithPath("pageInfo.totalElements").description("총 요소 수"),
                                fieldWithPath("pageInfo.totalPages").description("전체 페이지 수")
                        )
                ));
    }

    @Test
    @DisplayName("수입 조회 실패 1 : 월자가 유효하지 않은 경우")
    @Order(14)
    void getAllIncomesTest_Fail1() throws Exception {
        // given
        incomeRepository.deleteAll();

        // when
        mockMvc.perform(
                        get("/income")
                                .header("Authorization", token)
                                .param("page", "1")
                                .param("size", "5")
                                .param("date", "2024-123-01")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isBadRequest())
                .andDo(print())

                // documentation
                .andDo(document("IncomeIntegrationTest/getAllIncomesTest_Fail1",
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
    @DisplayName("수입 조회 실패 2 : 일자가 유효하지 않은 경우")
    @Order(15)
    void getAllIncomesTest_Fail2() throws Exception {
        // given
        incomeRepository.deleteAll();

        // when
        mockMvc.perform(
                        get("/income")
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
                .andDo(document("IncomeIntegrationTest/getAllIncomesTest_Fail2",
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
    @DisplayName("수입 삭제 성공 1 : 태그가 null인 경우")
    @Order(16)
    void deleteIncomeTest_Success1() throws Exception {
        // when
        mockMvc.perform(
                delete("/income/delete/{income-id}", income.getIncomeId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
        )

                // then
                .andExpect(status().isNoContent())
                .andDo(print())

                // documentation
                .andDo(document("IncomeIntegrationTest/deleteIncomeTest_Success1",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        )
                ));
    }

    @Test
    @DisplayName("수입 삭제 성공 2 : 태그와 연결된 다른 수입이 없는 경우")
    @Order(17)
    void deleteIncomeTest_Success2() throws Exception {
        // given
        LedgerTag tag = new LedgerTag();
        tag.setIncomes(List.of(income));
        tag.setLedgerTagId(1L);
        tag.setCategory(LedgerTag.Group.INCOME);
        tag.setMember(member);
        tag.setOutgos(null);
        tag.setTagName("testTag");
        ledgerTagRepository.save(tag);

        income.setLedgerTag(tag);
        incomeRepository.save(income);

        // when
        mockMvc.perform(
                        delete("/income/delete/{income-id}", income.getIncomeId())
                                .header("Authorization", token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isNoContent())
                .andDo(print())

                // documentation
                .andDo(document("IncomeIntegrationTest/deleteIncomeTest_Success2",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        )
                ));

        assertTrue(ledgerTagRepository.findById(1L).isEmpty());
    }

    @Test
    @DisplayName("수입 삭제 성공 3 : 태그와 연결된 다른 수입이 있는 경우")
    @Order(18)
    void deleteIncomeTest_Success3() throws Exception {
        // given
        LedgerTag tag = new LedgerTag();
        tag.setLedgerTagId(1L);
        tag.setCategory(LedgerTag.Group.INCOME);
        tag.setMember(member);
        tag.setOutgos(null);
        tag.setTagName("testTag");
        ledgerTagRepository.save(tag);

        income.setLedgerTag(tag);
        incomeRepository.save(income);

        Income income1 = new Income();
        income1.setIncomeId(2L);
        income1.setMoney(10000);
        income1.setIncomeName("testIncomeName");
        income1.setMemo("testIncomeMemo");
        income1.setDate(LocalDate.of(2024,1,1));
        income1.setMember(member);
        income1.setLedgerTag(tag);
        incomeRepository.save(income1);

        tag.setIncomes(List.of(income,income1));
        ledgerTagRepository.save(tag);

        // when
        mockMvc.perform(
                        delete("/income/delete/{income-id}", income.getIncomeId())
                                .header("Authorization", token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isNoContent())
                .andDo(print())

                // documentation
                .andDo(document("IncomeIntegrationTest/deleteIncomeTest_Success3",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        )
                ));

        // 태그 검증
        assertTrue(ledgerTagRepository.findById(1L).isPresent());
    }

    @Test
    @DisplayName("수입 삭제 실패 : 수입이 존재하지 않는 경우")
    @Order(19)
    void deleteIncomeTest_Fail() throws Exception {
        // given
        incomeRepository.deleteAll();

        // when
        mockMvc.perform(
                        delete("/income/delete/{income-id}", income.getIncomeId())
                                .header("Authorization", token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isNotFound())
                .andDo(print())

                // documentation
                .andDo(document("IncomeIntegrationTest/deleteIncomeTest_Fail",
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

    @Test
    @DisplayName("월별 수입 조회 성공 1 : 수입이 존재하는 경우")
    @Order(20)
    void getMonthlyIncomeTest_Success1() throws Exception {
        // when
        mockMvc.perform(
                        get("/income/monthly")
                                .header("Authorization", token)
                                .param("date", "2024-01")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isOk())
                .andDo(print())

                // documentation
                .andDo(document("IncomeIntegrationTest/getMonthlyIncomeTest_Success1",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
                                parameterWithName("date").description("조회 날짜")
                        ),
                        responseFields(
                                fieldWithPath("monthlyTotal").description("월별 합계"),
                                fieldWithPath("tags[]").description("포함된 태그 목록")
                        )
                ));
    }

    @Test
    @DisplayName("월별 수입 조회 성공 2 : 수입이 존재하지 않는 경우")
    @Order(21)
    void getMonthlyIncomeTest_Success2() throws Exception {
        // given
        incomeRepository.deleteAll();

        // when
        mockMvc.perform(
                        get("/income/monthly")
                                .header("Authorization", token)
                                .param("date", "2024-01")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isOk())
                .andDo(print())

                // documentation
                .andDo(document("IncomeIntegrationTest/getMonthlyIncomeTest_Success2",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
                                parameterWithName("date").description("조회 날짜")
                        ),
                        responseFields(
                                fieldWithPath("monthlyTotal").description("월별 합계"),
                                fieldWithPath("tags[]").description("포함된 태그 목록")
                        )
                ));
    }

    @Test
    @DisplayName("월별 수입 조회 실패 : 날짜가 유효하지 않은 경우")
    @Order(22)
    void getMonthlyIncomeTest_Fail() throws Exception {
        // when
        mockMvc.perform(
                        get("/income/monthly")
                                .header("Authorization", token)
                                .param("date", "2024-123")
                                .contentType(MediaType.APPLICATION_JSON)
                                .characterEncoding("UTF-8")
                )

                // then
                .andExpect(status().isBadRequest())
                .andDo(print())

                // documentation
                .andDo(document("IncomeIntegrationTest/getMonthlyIncomeTest_Fail",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestHeaders(
                                headerWithName("Authorization").description("JWT 액세스 토큰")
                        ),
                        requestParameters(
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
}
