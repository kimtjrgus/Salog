package com.codemouse.salog.ledger.fixedIncome.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.Size;
import java.time.LocalDate;

public class FixedIncomeDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        @Min(value = 1, message = "금액은 1 이상이어야 합니다.")
        @Max(value = 2147483646, message = "금액은 최대 2,147,483,646입니다.")
        private int money;
        @Size(max = 15, message = "incomeName이 15글자이내여야 합니다.")
        private String incomeName;
        private LocalDate date;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
        @Min(value = 1, message = "금액은 1 이상이어야 합니다.")
        @Max(value = 2147483646, message = "금액은 최대 2,147,483,646입니다.")
        private int money;
        @Size(max = 15, message = "incomeName이 15글자이내여야 합니다.")
        private String incomeName;
        private LocalDate date;
    }

    @AllArgsConstructor
    @Getter
    public static class Response {
        private long fixedIncomeId;
        private int money;
        private String incomeName;
        private LocalDate date;
    }
}
