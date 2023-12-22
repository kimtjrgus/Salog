package com.codemouse.salog.tags.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import javax.validation.constraints.Size;


public class TagDto {
    @AllArgsConstructor
    @Getter
    public static class DiaryPost {
        @Size(min = 1, max = 10)
        private String tagName;
    }

    @AllArgsConstructor
    @Getter
    public static class DiaryResponse {
        private Long diaryTagId;
        private String tagName;
    }
}
