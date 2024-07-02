package com.codemouse.salog.slice.ledger.budget.controller;

import com.codemouse.salog.auth.config.SecurityConfiguration;
import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.ledger.budget.controller.BudgetController;
import com.codemouse.salog.ledger.budget.dto.BudgetDto;
import com.codemouse.salog.ledger.budget.service.BudgetService;
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

@WebMvcTest(value = BudgetController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("예산 컨트롤러 슬라이스 테스트")
public class BudgetControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    Gson gson = new Gson();
    @MockBean
    private BudgetService budgetService;
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
    void postBudgetTest() throws Exception {
        // given
        String token = "testToken";
        LocalDate date = LocalDate.of(2024, 1, 1);

        BudgetDto.Post postDto = new BudgetDto.Post(
                date, 1000
        );

        gson = new GsonBuilder()
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
                .andDo(print());
    }

    @Test
    @DisplayName("/update/{budget-id}")
    @Order(2)
    void updateBudgetTest() throws Exception {
        // given
        String token = "testToken";
        LocalDate date = LocalDate.of(2024, 1, 1);

        BudgetDto.Patch patchDto = new BudgetDto.Patch(
                date, 1000
        );

        gson = new GsonBuilder()
                .registerTypeAdapter(LocalDate.class, new LocalDateSerializer())
                .create();

        String content = gson.toJson(patchDto);

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
                .andDo(print());
    }

    @Test
    @DisplayName("/")
    @Order(3)
    void getMonthlyBudgetTest() throws Exception {
        // given
        String token = "testToken";

        // when
        mockMvc.perform(
                get("/monthlyBudget")
                        .header("Authorization", token)
                        .param("date", "2024-01-01")
                )

                // then
                .andExpect(status().isOk())
                .andDo(print());
    }

    @Test
    @DisplayName("/delete/{budget-id}")
    @Order(4)
    void deleteBudgetTest() throws Exception {
        // given
        String token = "testToken";

        // when
        mockMvc.perform(
                delete("/monthlyBudget/delete/{budget-id}", 1L)
                        .header("Authorization", token)
                )

                // then
                .andExpect(status().isNoContent())
                .andDo(print());
    }
}






























