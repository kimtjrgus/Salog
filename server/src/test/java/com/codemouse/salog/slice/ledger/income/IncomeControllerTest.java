package com.codemouse.salog.slice.ledger.income;

import com.codemouse.salog.auth.config.SecurityConfiguration;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.ledger.income.controller.IncomeController;
import com.codemouse.salog.ledger.income.dto.IncomeDto;
import com.codemouse.salog.ledger.income.service.IncomeService;
import com.google.gson.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.lang.reflect.Type;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = IncomeController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("수입 컨트롤러 슬라이스 테스트")
public class IncomeControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    Gson gson = new Gson();
    @MockBean
    private IncomeService incomeService;
    @MockBean
    private TokenBlackListService tokenBlackListService;
    @MockBean
    private SecurityConfiguration securityConfiguration;

    /*
    LocalDate 타입의 날짜를 "date":{"year":2024,"month":1,"day":1} 로 자동 직렬화하여 테스트가 실패함 (400 리턴)
    직렬화 시 "date" : "2024-01-01" 로 변경하기 위해 Gson 라이브러리의 커스텀 직렬화 기능 사용
    해당 문제를 확인하기 위해 .characterEncoding("UTF-8") 적용
    */
    private static class LocalDateSerializer implements JsonSerializer<LocalDate> {
        @Override
        public JsonElement serialize(LocalDate src, Type typeOfSrc, JsonSerializationContext context) {
            return new JsonPrimitive(src.format(DateTimeFormatter.ISO_LOCAL_DATE));
        }
    }

    @Test
    @DisplayName("/post")
    @Order(1)
    void postIncomeTest() throws Exception {
        // Given
        LocalDate date = LocalDate.of(2024, 1, 1);
        IncomeDto.Post post = new IncomeDto.Post(100, "testName", "testMemo", date, "testTag");

        // LocalDate 커스텀 직렬화
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .create();

        String content = gson.toJson(post);

        // When
        mockMvc.perform(
                post("/income/post")
                        .header("Authorization", "Bearer fakeToken")
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
                )

                // Then
                .andExpect(status().isCreated())
                .andDo(print());
    }

    @Test
    @DisplayName("/update/{income-id}")
    @Order(2)
    void updateIncomeTest() throws Exception {
        // Given
        IncomeDto.Patch patch = new IncomeDto.Patch(100, "testName", "testMemo", "testTag");
        String content = gson.toJson(patch);

        // When
        mockMvc.perform(
                patch("/income/update/{income-id}", 1L)
                        .header("Authorization", "Bearer fakeToken")
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8")
                        .content(content)
                )

                // Then
                .andExpect(status().isOk())
                .andDo(print());
    }

    @Test
    @DisplayName("/income : 전체 Read")
    @Order(3)
    void getAllIncomesTest() throws Exception {
        // Given

        // When
        mockMvc.perform(
                get("/income")
                        .header("Authorization", "Bearer fakeToken")
                        .param("page", "1")
                        .param("size", "1")
                        .param("incomeTag", "testTag")
                        .param("date", "2024-01-01")
                )
                // then
                .andExpect(status().isOk())
                .andDo(print());
    }

    @Test
    @DisplayName("/delete/{income-id}")
    @Order(4)
    void deleteIncomeTest() throws Exception {
        // Given

        // When
        mockMvc.perform(
                delete("/income/delete/{income-id}", 1L)
                        .header("Authorization", "Bearer fakeToken")
                )

                // Then
                .andExpect(status().isNoContent())
                .andDo(print());
    }

    @Test
    @DisplayName("/monthly")
    @Order(5)
    void getMonthlyIncomeTest() throws Exception {
        // Given

        // When
        mockMvc.perform(
                        get("/income/monthly")
                                .header("Authorization", "Bearer fakeToken")
                                .param("date", "2024-01")
                )

                // Then
                .andExpect(status().isOk())
                .andDo(print());
    }
}
