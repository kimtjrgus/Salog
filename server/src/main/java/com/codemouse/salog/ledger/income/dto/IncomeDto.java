package com.codemouse.salog.ledger.income.dto;

import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

public class IncomeDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        private int money;
        private String incomeName;
        private String memo;
        private LocalDate date;
        private String incomeTag;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
        private int money;
        private String incomeName;
        private String memo;
        //todo 2024-01-03 다이어리 핸들링
        private long diaryId;
        private String incomeTag;
    }

    @AllArgsConstructor
    @Getter
    @Setter
    public static class Response {
        private long incomeId;
        private int money;
        private String incomeName;
        private String memo;
        private LocalDate date;
        private LedgerTagDto.Response incomeTag;
    }
}