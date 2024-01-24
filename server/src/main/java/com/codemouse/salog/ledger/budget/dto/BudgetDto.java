package com.codemouse.salog.ledger.budget.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.time.LocalDate;

public class BudgetDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        private LocalDate date;
        @Min(value = 1, message = "금액은 1 이상이어야 합니다.")
        @Max(value = 2147483646, message = "금액은 최대 2,147,483,646입니다.")
        private int budget;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
        private LocalDate date;
        @Min(value = 1, message = "금액은 1 이상이어야 합니다.")
        @Max(value = 2147483646, message = "금액은 최대 2,147,483,646입니다.")
        private int budget;
    }

    @AllArgsConstructor
    @Getter
    @Setter
    public static class Response {
        private long budgetId;
        private LocalDate date;
        private int budget;
        private long totalOutgo; // 지출 월별 합계 계산 (비교를 위함)
        private int dayRemain;
    }
}
