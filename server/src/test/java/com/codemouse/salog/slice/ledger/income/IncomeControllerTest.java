package com.codemouse.salog.slice.ledger.income;

import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.ledger.income.controller.IncomeController;
import com.codemouse.salog.ledger.income.dto.IncomeDto;
import com.codemouse.salog.ledger.income.service.IncomeService;
import com.google.gson.Gson;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

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

    @Test
    @DisplayName("/post")
    @Order(1)
    void postIncomeTest() {
        // Given
        LocalDate date = LocalDate.of(2024, 1, 1);
        IncomeDto.Post post = new IncomeDto.Post(100, "testIncome", "testMemo",date, "testTag");


    }
}
