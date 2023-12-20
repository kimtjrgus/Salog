package com.codemouse.salog.tags.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import javax.validation.constraints.Pattern;


public class TagDto {
    @AllArgsConstructor
    @Getter
    public static class DiaryPost {
        @Pattern(regexp = "^.{1,10}$")
        private String tagName;
    }

    @AllArgsConstructor
    @Getter
    public static class DiaryResponse {
        private Long diaryTagId;
        private String tagName;
    }
}
