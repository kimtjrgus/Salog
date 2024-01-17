package com.codemouse.salog.ledger.budget.controller;

import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.ledger.budget.dto.BudgetDto;
import com.codemouse.salog.ledger.budget.service.BudgetService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Positive;
import java.time.LocalDate;

@RestController
@RequestMapping("/monthlyBudget")
@AllArgsConstructor
@Validated
@Slf4j
public class BudgetController {
    private final BudgetService budgetService;
    private final TokenBlackListService tokenBlackListService;

    @PostMapping("/post")
    @ResponseStatus(HttpStatus.CREATED)
    public void postBudget(@RequestHeader(name = "Authorization") String token,
                           @Valid @RequestBody BudgetDto.Post requestBody) {
        tokenBlackListService.isBlackListed(token);

        budgetService.createBudget(token, requestBody);
    }

    @PatchMapping("/update/{budget-id}")
    @ResponseStatus(HttpStatus.OK)
    public void updateBudget(@RequestHeader(name = "Authorization") String token,
                             @PathVariable("budget-id") @Positive long budgetId,
                             @Valid @RequestBody BudgetDto.Patch requestBody) {
        tokenBlackListService.isBlackListed(token);

        budgetService.updateBudget(token, budgetId, requestBody);
    }

    @GetMapping
    public ResponseEntity<?> getMonthlyBudget(@RequestHeader(name = "Authorization") String token,
                                              @RequestParam String date) {
        tokenBlackListService.isBlackListed(token);

        BudgetDto.Response response = budgetService.findBudget(token, date);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{budget-id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBudget(@RequestHeader(name = "Authorization") String token,
                             @PathVariable("budget-id") @Positive long budgetId) {
        tokenBlackListService.isBlackListed(token);

        budgetService.deleteBudget(token, budgetId);
    }
}
