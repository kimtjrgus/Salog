package com.codemouse.salog.ledger.fixedOutgo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

public class FixedOutgoDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        private String date;
        private Long money;
        private String outgoName;
    }
    @AllArgsConstructor
    @Getter
    public static class Patch {
        private String date;
        private Long money;
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
