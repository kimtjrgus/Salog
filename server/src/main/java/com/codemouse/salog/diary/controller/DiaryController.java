package com.codemouse.salog.diary.controller;

import com.codemouse.salog.diary.dto.DiaryDto;
import com.codemouse.salog.diary.service.DiaryService;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.dto.SingleResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Positive;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/diary")
@Validated
@Slf4j
public class DiaryController {
    private final DiaryService diaryService;

    public DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }


    // post
    @PostMapping("/post")
    @ResponseStatus(HttpStatus.CREATED)
    public void createDiary (@RequestHeader(name = "Authorization") String token,
                             @Valid @RequestBody DiaryDto.Post requestBody){
        diaryService.postDiary(token, requestBody);
    }

    // patch
    @PatchMapping("/{diary-id}/update")
    @ResponseStatus(HttpStatus.OK)
    public void updateDiary (@RequestHeader(name = "Authorization") String token,
                             @PathVariable("diary-id") @Positive long diaryId,
                             @Valid @RequestBody DiaryDto.Patch requestBody){
        diaryService.patchDiary(token, diaryId, requestBody);
    }

    // get
    @GetMapping("/{diary-id}")
    public ResponseEntity getDiary (@RequestHeader(name = "Authorization") String token,
                                    @PathVariable("diary-id") @Positive long diaryId){
        DiaryDto.Response response = diaryService.findDiary(token, diaryId);

        return new ResponseEntity<>(
                new SingleResponseDto<>(response), HttpStatus.OK);
    }

    // total list get
    @GetMapping
    public ResponseEntity getAllDiaries (@RequestHeader(name = "Authorization") String token,
                                        @Positive @RequestParam int page,
                                        @Positive @RequestParam int size,
                                        @Valid @RequestParam(required = false) String diaryTag,
                                        @Positive @RequestParam(required = false) Integer month,
                                        @RequestParam(required = false) String date){
        // UTF-8로 디코딩
        String decodedTag = URLDecoder.decode(diaryTag, StandardCharsets.UTF_8);
        log.info("#DecodedTag To UTF-8 : {}", decodedTag);

        MultiResponseDto<DiaryDto.Response> pageDiaries =
                diaryService.findAllDiaries(token, page, size, decodedTag, month, date);

        return new ResponseEntity<>(pageDiaries, HttpStatus.OK);
    }

    // title list get
    @GetMapping("/search")
    public ResponseEntity getTitleDiaries (@RequestHeader(name = "Authorization") String token,
                                          @Positive @RequestParam int page,
                                          @Positive @RequestParam int size,
                                          @Valid @RequestParam String title){
        // UTF-8로 디코딩
        String decodedTitle = URLDecoder.decode(title, StandardCharsets.UTF_8);
        log.info("#DecodedTitle To UTF-8 : {}", decodedTitle);

        MultiResponseDto<DiaryDto.Response> pageDiaries =
                diaryService.findTitleDiaries(token, page, size, decodedTitle);

        return new ResponseEntity<>(pageDiaries, HttpStatus.OK);
    }

    // delete
    @DeleteMapping("/{diary-id}/delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDiary (@RequestHeader(name = "Authorization") String token,
                             @PathVariable("diary-id") @Positive long diaryId){
        diaryService.deleteDiary(token, diaryId);
    }
}
