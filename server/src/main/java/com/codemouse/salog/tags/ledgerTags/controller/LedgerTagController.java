package com.codemouse.salog.tags.ledgerTags.controller;

import com.codemouse.salog.dto.SingleResponseDto;
import com.codemouse.salog.tags.ledgerTags.dto.LedgerTagDto;
import com.codemouse.salog.tags.ledgerTags.service.LedgerTagService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("/ledgerTags")
@Validated
@Slf4j
@AllArgsConstructor
public class LedgerTagController {
    private final LedgerTagService ledgerTagService;

    @GetMapping("/income")
    public ResponseEntity<?> getAllIncomeTags (@RequestHeader(name = "Authorization") String token) {
        List<LedgerTagDto.Response> response = ledgerTagService.getAllIncomeTags(token);

        return new ResponseEntity<>(new SingleResponseDto<>(response), HttpStatus.OK);
    }

    @GetMapping("/outgo")
    public ResponseEntity<?> getAllOutgoTags (@RequestHeader(name = "Authorization") String token) {
        List<LedgerTagDto.Response> response = ledgerTagService.getAllOutgoTags(token);

        return new ResponseEntity<>(new SingleResponseDto<>(response), HttpStatus.OK);
    }
}

