package com.codemouse.salog.slice.ledger.fixedIncome.controller;

import com.codemouse.salog.auth.config.SecurityConfiguration;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.ledger.fixedIncome.controller.FixedIncomeController;
import com.codemouse.salog.ledger.fixedIncome.dto.FixedIncomeDto;
import com.codemouse.salog.ledger.fixedIncome.service.FixedIncomeService;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = FixedIncomeController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("고정 수입 컨트롤러 슬라이스 테스트")
public class FixedIncomeControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    Gson gson = new Gson();
    @MockBean
    private FixedIncomeService fixedIncomeService;
    @MockBean
    private TokenBlackListService tokenBlackListService;
    @MockBean
    private SecurityConfiguration securityConfiguration;

    // Gson 커스텀 직렬화 (LocalDate)
    private static class LocalDateSerializer implements JsonSerializer<LocalDate> {
        @Override
        public JsonElement serialize(LocalDate src, Type typeOfSrc, JsonSerializationContext context) {
            return new JsonPrimitive(src.format(DateTimeFormatter.ISO_LOCAL_DATE));
        }
    }

    @Test
    @DisplayName("/post")
    @Order(1)
    void postFixedIncomeTest() throws Exception {
        // given
        String token = "testToken";
        String fixedIncomeName = "testName";
        LocalDate date = LocalDate.of(2024, 1, 1);

        FixedIncomeDto.Post postDto = new FixedIncomeDto.Post(
                1000, fixedIncomeName,  date
        );

        gson = new GsonBuilder()
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
                .andDo(print());
    }

    @Test
    @DisplayName("/update/{fixedIncome-id}")
    @Order(2)
    void patchFixedIncomeTest() throws Exception {
        // given
        String token = "testToken";
        String fixedIncomeName = "testName";
        LocalDate date = LocalDate.of(2024, 1, 1);

        FixedIncomeDto.Patch patchDto = new FixedIncomeDto.Patch(
                1000, fixedIncomeName, date
        );

        gson = new GsonBuilder()
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
                .andDo(print());
    }

    @Test
    @DisplayName("/get")
    @Order(3)
    void getAllFixedIncomesTest() throws Exception {
        // given
        String token = "testToken";

        // when
        mockMvc.perform(
                        get("/fixedIncome/get")
                                .header("Authorization", token)
                                .param("page", "1")
                                .param("size", "1")
                                .param("date", "2024-01-01")
                )

                // then
                .andExpect(status().isOk())
                .andDo(print());
    }

    @Test
    @DisplayName("delete/{fixedIncome-id}")
    @Order(4)
    void deleteFixedIncomeTest() throws Exception {
        // given
        String token = "testToken";

        mockMvc.perform(
                delete("/fixedIncome/delete/{fixedIncome-id}", 1L)
                        .header("Authorization", token)
                )

                // then
                .andExpect(status().isNoContent())
                .andDo(print());
    }
}
