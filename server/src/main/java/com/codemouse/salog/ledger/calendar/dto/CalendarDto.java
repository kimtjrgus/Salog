package com.codemouse.salog.ledger.calendar.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

public class CalendarDto {
    @AllArgsConstructor
    @Getter
    public static class Response {
        private String date;
        private long totalOutgo;
        private long totalIncome;
    }
}
