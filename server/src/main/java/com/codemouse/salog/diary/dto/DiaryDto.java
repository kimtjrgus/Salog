package com.codemouse.salog.diary.dto;

import com.codemouse.salog.tags.dto.TagDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

public class DiaryDto {
    @AllArgsConstructor
    @Getter
    public static class Post {
        private LocalDate date;
        private String title;
        private String body;
        private String img;
        private List<String> tagList;
    }

    @AllArgsConstructor
    @Getter
    public static class Patch {
        private String title;
        private String body;
        private String img;
        private List<String> tagList;
    }

    @AllArgsConstructor
    @Getter
    @Setter
    public static class Response {
        private Long diaryId;
        private LocalDate date;
        private String title;
        private String body;
        private String img;
        private List<TagDto.DiaryResponse> tagList;
    }
}
