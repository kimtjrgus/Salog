package com.codemouse.salog.tags.controller;

import com.codemouse.salog.dto.SingleResponseDto;
import com.codemouse.salog.tags.dto.TagDto;
import com.codemouse.salog.tags.service.TagService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@Slf4j
@AllArgsConstructor
public class TagController {
    private final TagService service;

    @GetMapping("/diaryTags")
    public ResponseEntity getAllDiaryTags (@RequestHeader(name = "Authorization") String token){
        List<TagDto.DiaryResponse> response = service.getAllDiaryTagList(token);

        return new ResponseEntity<>(new SingleResponseDto<>(response), HttpStatus.OK);
    }
}
