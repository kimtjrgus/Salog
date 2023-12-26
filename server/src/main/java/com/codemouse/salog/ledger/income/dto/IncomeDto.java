package com.codemouse.salog.ledger.income.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

public class IncomeDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        private int money;
        private String incomeName;
        private String memo;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
        private int money;
        private String incomeName;
        private String memo;
    }

    @AllArgsConstructor
    @Getter
    public static class Response {
        private long incomeId;
        private int money;
        private String incomeName;
        private String memo;
        private LocalDateTime createdAt;
    }
}
