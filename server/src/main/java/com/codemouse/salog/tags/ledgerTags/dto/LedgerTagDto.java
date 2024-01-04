package com.codemouse.salog.tags.ledgerTags.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import javax.validation.constraints.Size;

public class LedgerTagDto {
    @AllArgsConstructor
    @Getter
    public static class LedgerPost {
        @Size(min = 1, max = 10)
        private String tagName;
    }

    @AllArgsConstructor
    @Getter
    public static class LedgerResponse {
        private long ledgerTagId;
        private String tagName;
    }
}
