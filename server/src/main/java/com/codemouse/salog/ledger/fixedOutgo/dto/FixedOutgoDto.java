package com.codemouse.salog.ledger.fixedOutgo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.Size;

public class FixedOutgoDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        private String date;
        @Min(value = 1, message = "금액은 1 이상이어야 합니다.")
        @Max(value = 2147483646, message = "금액은 최대 2,147,483,646입니다.")
        private Long money;
        @Size(max = 15, message = "outgoName이 15글자이내여야 합니다.")
        private String outgoName;
    }
    @AllArgsConstructor
    @Getter
    public static class Patch {
        private String date;
        @Min(value = 1, message = "금액은 1 이상이어야 합니다.")
        @Max(value = 2147483646, message = "금액은 최대 2,147,483,646입니다.")
        private Long money;
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
