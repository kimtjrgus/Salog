package com.codemouse.salog.ledger.outgo.controller;

import com.codemouse.salog.dto.MultiResponseDto;
import com.codemouse.salog.ledger.outgo.dto.OutgoDto;
import com.codemouse.salog.ledger.outgo.service.OutgoService;
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
@RequestMapping("/outgo")
public class OutgoController {
    private final OutgoService service;

    public OutgoController(OutgoService service) {
        this.service = service;
    }

    // POST
    @PostMapping("/post")
    @ResponseStatus(HttpStatus.CREATED)
    public void createOutgo (@RequestHeader(name = "Authorization") String token,
                             @Valid @RequestBody OutgoDto.Post requestBody){
        service.postOutgo(token, requestBody);
    }

    // PATCH
    @PatchMapping("/update/{outgo-id}")
    @ResponseStatus(HttpStatus.OK)
    public void updateOutgo (@RequestHeader(name = "Authorization") String token,
                             @PathVariable("outgo-id") @Positive long outgoId,
                             @Valid @RequestBody OutgoDto.Patch requestBody){
        service.patchOutgo(token, outgoId, requestBody);
    }

    // GET All List
    @GetMapping
    public ResponseEntity getOutgoLists (@RequestHeader(name = "Authorization") String token,
                                         @Positive @RequestParam int page,
                                         @Positive @RequestParam int size,
                                         @Valid @RequestParam String date,
                                         @Valid @RequestParam(required = false) String outgoTag){

        MultiResponseDto<OutgoDto.Response> outgoPages = service.findAllOutgos(token, page, size, date, outgoTag);
        return new ResponseEntity<>(outgoPages, HttpStatus.OK);
    }

    // DELETE
    @DeleteMapping("/delete/{outgo-id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOutgo (@RequestHeader(name = "Authorization") String token,
                             @PathVariable("outgo-id") @Positive long outgoId){
        service.deleteOutgo(token, outgoId);
    }
}