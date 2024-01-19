package com.codemouse.salog.ledger.budget.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

public class BudgetDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        private LocalDate date;
        private long budget;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
        private LocalDate date;
        private long budget;
    }

    @AllArgsConstructor
    @Getter
    @Setter
    public static class Response {
        private long budgetId;
        private LocalDate date;
        private long budget;
        private long totalOutgo; // 지출 월별 합계 계산 (비교를 위함)
        private int dayRemain;
    }
}
