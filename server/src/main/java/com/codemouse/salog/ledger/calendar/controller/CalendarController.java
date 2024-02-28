package com.codemouse.salog.ledger.calendar.controller;

import com.codemouse.salog.auth.utils.TokenBlackListService;
import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.ledger.calendar.dto.CalendarDto;
import com.codemouse.salog.ledger.calendar.service.CalendarService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Positive;
import java.util.List;

@RestController
@Slf4j
@Validated
@AllArgsConstructor
@RequestMapping("/calendar")
public class CalendarController {
    private final CalendarService calendarService;
    private final TokenBlackListService tokenBlackListService;

    @GetMapping
    public ResponseEntity<?> getCalendar(@RequestHeader(name = "Authorization") String token,
                                         @Valid @RequestParam String date){
        tokenBlackListService.isBlackListed(token);
        List<CalendarDto.Response> responses = calendarService.getCalendar(token, date);

        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @GetMapping("/ledger")
    public ResponseEntity<?> getIntegratedLedger(@RequestHeader(name = "Authorization") String token,
                                                 @Positive @RequestParam int page,
                                                 @Positive @RequestParam int size,
                                                 @Valid @RequestParam String date,
                                                 @Valid @RequestParam(required = false) String ledgerTag){
        tokenBlackListService.isBlackListed(token);
        MultiResponseDto<CalendarDto.LedgerResponse> responses = calendarService.getIntegratedLedger(token, page, size, date, ledgerTag);

        return new ResponseEntity<>(responses, HttpStatus.OK);
    }
}
