package com.codemouse.salog.ledger.fixedIncome.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

public class FixedIncomeDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        private int money;
        private String incomeName;
        private LocalDate date;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
        private int money;
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
