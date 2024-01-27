package com.codemouse.salog.ledger.income.controller;

import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.ledger.income.dto.IncomeDto;
import com.codemouse.salog.ledger.income.service.IncomeService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Positive;

@RestController
@RequestMapping("/income")
@Validated
@AllArgsConstructor
@Slf4j
public class IncomeController {
    private final IncomeService incomeService;
    private final TokenBlackListService tokenBlackListService;

    @PostMapping("/post")
    public ResponseEntity<?> postIncome(@RequestHeader(name = "Authorization") String token,
                           @Valid @RequestBody IncomeDto.Post requestBody) {
        tokenBlackListService.isBlackListed(token);

        IncomeDto.Response response = incomeService.createIncome(token, requestBody);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/update/{income-id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<?> updateIncome(@RequestHeader(name = "Authorization") String token,
                             @PathVariable("income-id") @Positive long incomeId,
                             @Valid @RequestBody IncomeDto.Patch requestBody) {
        tokenBlackListService.isBlackListed(token);

        IncomeDto.Response response = incomeService.updateIncome(token, incomeId, requestBody);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<?> getAllIncomes (@RequestHeader(name = "Authorization") String token,
                                            @Positive @RequestParam int page,
                                            @Positive @RequestParam int size,
                                            @Valid @RequestParam(required = false) String incomeTag,
                                            @RequestParam String date) { // 날짜는 스트링으로 입력받고, 서비스에서 핸들링 (월별 조회 00 처리 시)

        tokenBlackListService.isBlackListed(token);

        MultiResponseDto<IncomeDto.Response> pages =
                incomeService.getIncomes(token, page, size, incomeTag, date);

        return new ResponseEntity<>(pages, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{income-id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIncome(@RequestHeader(name = "Authorization") String token,
                             @PathVariable("income-id") @Positive long incomeId) {
        tokenBlackListService.isBlackListed(token);

        incomeService.deleteIncome(token, incomeId);
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyIncome(@RequestHeader(name = "Authorization") String token,
                                              @RequestParam String date) {
        tokenBlackListService.isBlackListed(token);

        IncomeDto.MonthlyResponse response = incomeService.getMonthlyIncome(token, date);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
