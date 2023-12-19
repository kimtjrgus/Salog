package com.codemouse.salog.tags.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;


public class TagDto {
    @AllArgsConstructor
    @Getter
    public static class DiaryPost {
        private String tagName;
    }

    @AllArgsConstructor
    @Getter
    public static class DiaryResponse {
        private Long diaryTagId;
        private String tagName;
    }
}
