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
        private int money;
        @Size(max = 15, message = "incomeName이 15글자이내여야 합니다.")
        private String incomeName;
        private LocalDate date;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
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
