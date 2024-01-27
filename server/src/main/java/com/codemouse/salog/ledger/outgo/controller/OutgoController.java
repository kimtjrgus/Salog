package com.codemouse.salog.ledger.outgo.controller;

import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.ledger.outgo.dto.OutgoDto;
import com.codemouse.salog.ledger.outgo.service.OutgoService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Positive;

@RestController
@Slf4j
@Validated
@AllArgsConstructor
@RequestMapping("/outgo")
public class OutgoController {
    private final OutgoService service;

    @PostMapping("/post")
    public ResponseEntity<?> createOutgo (@RequestHeader(name = "Authorization") String token,
                             @Valid @RequestBody OutgoDto.Post requestBody){
        OutgoDto.Response response = service.postOutgo(token, requestBody);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    @PatchMapping("/update/{outgo-id}")
    public ResponseEntity<?> updateOutgo (@RequestHeader(name = "Authorization") String token,
                             @PathVariable("outgo-id") @Positive long outgoId,
                             @Valid @RequestBody OutgoDto.Patch requestBody){
        OutgoDto.Response response = service.patchOutgo(token, outgoId, requestBody);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<?> getOutgoLists (@RequestHeader(name = "Authorization") String token,
                                         @Positive @RequestParam int page,
                                         @Positive @RequestParam int size,
                                         @Valid @RequestParam String date,
                                         @Valid @RequestParam(required = false) String outgoTag){

        MultiResponseDto<OutgoDto.Response> outgoPages =
                service.findAllOutgos(token, page, size, date, outgoTag);
        return new ResponseEntity<>(outgoPages, HttpStatus.OK);
    }

    @GetMapping("/wasteList")
    public ResponseEntity<?> getWasteLists (@RequestHeader(name = "Authorization") String token,
                                         @Positive @RequestParam int page,
                                         @Positive @RequestParam int size,
                                         @Valid @RequestParam String date,
                                         @Valid @RequestParam(required = false) String outgoTag){

        MultiResponseDto<OutgoDto.Response> wastePages =
                service.findAllWasteLists(token, page, size, date, outgoTag);
        return new ResponseEntity<>(wastePages, HttpStatus.OK);
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> getSumOfOutgoLists (@RequestHeader(name = "Authorization") String token,
                                    @Valid @RequestParam String date){
        OutgoDto.MonthlyResponse sumOfOutgos =
                service.getSumOfOutgoLists(token, date);

        return new ResponseEntity<>(sumOfOutgos, HttpStatus.OK);
    }

    @GetMapping("/wasteList/monthly")
    public ResponseEntity<?> getSumOfWasteLists (@RequestHeader(name = "Authorization") String token,
                                    @Valid @RequestParam String date){
        OutgoDto.MonthlyResponse sumOfWasteLists =
                service.getSumOfWasteLists(token, date);

        return new ResponseEntity<>(sumOfWasteLists, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{outgo-id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOutgo (@RequestHeader(name = "Authorization") String token,
                             @PathVariable("outgo-id") @Positive long outgoId){
        service.deleteOutgo(token, outgoId);
    }
}