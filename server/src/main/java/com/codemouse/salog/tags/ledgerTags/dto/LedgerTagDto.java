package com.codemouse.salog.tags.ledgerTags.dto;

import com.codemouse.salog.tags.ledgerTags.entity.LedgerTag;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Size;

public class LedgerTagDto {
    @AllArgsConstructor
    @Getter
    @Setter
    public static class Post {
        @Size(min = 1, max = 10)
        private String tagName;
        private LedgerTag.Group category; // TODO dto안에 엔티티 객체가 들어있는 것에 대하여
    }

    @AllArgsConstructor
    @Getter
    @Setter
    public static class Response {
        private long ledgerTagId;
        private String tagName;
    }

    @AllArgsConstructor
    @Getter
    @Setter
    public static class MonthlyResponse {
        private String tagName;
        private long tagSum;
    }
}
