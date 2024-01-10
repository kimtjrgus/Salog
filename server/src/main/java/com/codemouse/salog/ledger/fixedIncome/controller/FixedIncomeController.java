package com.codemouse.salog.ledger.fixedIncome.controller;

import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.ledger.fixedIncome.dto.FixedIncomeDto;
import com.codemouse.salog.ledger.fixedIncome.service.FixedIncomeService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Positive;

@RestController
@RequestMapping("/fixedIncome")
@Validated
@AllArgsConstructor
@Slf4j
public class FixedIncomeController {
    private final FixedIncomeService fixedIncomeService;
    private final TokenBlackListService tokenBlackListService;

    @PostMapping("/post")
    @ResponseStatus(HttpStatus.CREATED)
    public void postFixedIncome (@RequestHeader(name = "Authorization") String token,
                                @Valid @RequestBody FixedIncomeDto.Post requestBody) {
        tokenBlackListService.isBlackListed(token);

        fixedIncomeService.createFixedIncome(token, requestBody);
    }

    @PatchMapping("/update/{fixedIncome-id}")
    @ResponseStatus(HttpStatus.OK)
    public void patchFixedIncome (@RequestHeader(name = "Authorization") String token,
                                 @PathVariable("fixedIncome-id") @Positive long fixedIncomeId,
                                 @Valid @RequestBody FixedIncomeDto.Patch requestBody) {
        tokenBlackListService.isBlackListed(token);

        fixedIncomeService.updateFixedIncome(token, fixedIncomeId, requestBody);
    }

    @GetMapping("/get")
    public ResponseEntity<?> getAllFixedIncomes (@RequestHeader(name = "Authorization") String token,
                                                 @Positive @RequestParam int page,
                                                 @Positive @RequestParam int size,
                                                 @RequestParam String date) {
        tokenBlackListService.isBlackListed(token);

        MultiResponseDto<FixedIncomeDto.Response> pages =
                fixedIncomeService.getFixedIncomes(token, page, size, date);

        return new ResponseEntity<>(pages, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{fixedIncome-id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFixedIncome (@RequestHeader(name = "Authorization") String token,
                                   @PathVariable("fixedIncome-id") @Positive long fixedIncomeId) {
        tokenBlackListService.isBlackListed(token);

        fixedIncomeService.deleteFixedIncome(token, fixedIncomeId);
    }
}
