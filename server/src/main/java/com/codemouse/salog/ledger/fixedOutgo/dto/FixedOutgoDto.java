package com.codemouse.salog.ledger.fixedOutgo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import javax.validation.constraints.Size;
import java.time.LocalDate;

public class FixedOutgoDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        private LocalDate date;
        private int money;
        @Size(max = 15, message = "outgoName이 15글자이내여야 합니다.")
        private String outgoName;
    }
    @AllArgsConstructor
    @Getter
    public static class Patch {
        private LocalDate date;
        private int money;
        @Size(max = 15, message = "outgoName이 15글자이내여야 합니다.")
        private String outgoName;
    }
    @AllArgsConstructor
    @Getter
    public static class Response {
        private Long fixedOutgoId;
        private String date;
        private Long money;
        private String outgoName;
    }
}
