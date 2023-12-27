package com.codemouse.salog.ledger.outgo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;


public class OutgoDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        private LocalDate date;
        private Integer money;
        private String outgoName;
        private String outgoTag;
        private boolean wasteList;
        private String memo;
        private String receiptImg;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
        private Integer money;
        private String outgoName;
        private boolean wasteList;
        private String memo;
        private String receiptImg;
    }

    @AllArgsConstructor
    @Getter
    public static class Response {
        private Long outgoId;
        private Long diaryId;
        private LocalDate date;
        private Integer money;
        private String outgoName;
        private boolean wasteList;
        private String memo;
        private String receiptImg;
    }
}
