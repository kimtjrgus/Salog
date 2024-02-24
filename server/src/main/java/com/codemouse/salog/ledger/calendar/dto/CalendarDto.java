package com.codemouse.salog.ledger.calendar.dto;


import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

public class CalendarDto {
    @AllArgsConstructor
    @Getter
    public static class Response {
        private String date;
        private long totalOutgo;
        private long totalIncome;
    }

    @AllArgsConstructor
    @Getter
    public static class LedgerResponse {    // 통합조회 응답 Dto
        private Long incomeId;
        private Long outgoId;
        private LocalDate date;
        private int money;
        private String ledgerName;  // 거래처
        private String payment;
        private String memo;
        private LedgerTagDto.Response ledgerTag;    // 카테고리
        private Boolean wasteList;
        private String receiptImg;
    }
}
